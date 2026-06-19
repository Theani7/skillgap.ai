import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field

from api.auth import get_current_admin
from api.database import get_db_connection
from api.scraper import simulate_trend_update
from api.course_scraper import scrape_courses_for_field, FIELD_SEARCH_QUERIES

logger = logging.getLogger("resume-analyzer")

router = APIRouter(tags=["admin"])


def log_audit_action(admin_user: dict, action: str, target_type: str, target_id: str = None, details: str = "", request: Request = None):
    """Log an admin action to the audit_logs table."""
    ip_address = ""
    if request:
        ip_address = request.client.host if request.client else ""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (admin_user_id, admin_username, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (admin_user.get("id"), admin_user.get("username", ""), action, target_type, str(target_id) if target_id else "", details, ip_address)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.warning(f"Failed to write audit log: {e}")


class CourseInput(BaseModel):
    field: str
    course_name: str
    course_url: str


@router.post("/api/admin/trigger-scrape")
def trigger_simulated_scrape(current_admin: dict = Depends(get_current_admin)):
    """Allows an admin to manually trigger a simulated market shift."""
    result = simulate_trend_update()
    return result


@router.get("/api/admin/users")
def get_admin_users(
    current_admin: dict = Depends(get_current_admin),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Select only safe columns, exclude sensitive system info
        cursor.execute(
            """
            SELECT ID, user_id, Name, Email_ID, Timestamp, Predicted_Field, resume_score,
                   target_role, missing_skills, Actual_skills, Recommended_skills,
                   pdf_name
            FROM user_data
            ORDER BY ID DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        )
        rows = cursor.fetchall()
        # Get total count for pagination
        cursor.execute("SELECT COUNT(*) as total FROM user_data")
        total = cursor.fetchone()["total"]
    finally:
        conn.close()
    return {"users": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


@router.get("/api/admin/users/{analysis_id}")
def get_admin_user_detail(analysis_id: int, current_admin: dict = Depends(get_current_admin)):
    """Fetch full analysis data for a single resume upload."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT ID, user_id, Name, Email_ID, Timestamp, Predicted_Field, resume_score,
                   target_role, missing_skills, Actual_skills, Recommended_skills,
                   pdf_name, analysis_data
            FROM user_data
            WHERE ID = ?
            """,
            (analysis_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Analysis not found")
    finally:
        conn.close()
    return {"analysis": dict(row)}


@router.get("/api/admin/feedback")
def get_admin_feedback(
    current_admin: dict = Depends(get_current_admin),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT ID, feed_name, feed_email, feed_score, comments, Timestamp FROM user_feedback ORDER BY ID DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) as total FROM user_feedback")
        total = cursor.fetchone()["total"]
    finally:
        conn.close()
    return {"feedback": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


@router.delete("/api/admin/users/{user_id}")
def delete_admin_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_data WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM user_preferences WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM shared_reports WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM login_attempts WHERE username = (SELECT username FROM users WHERE id = ?)", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": f"User {user_id} deleted."}


@router.delete("/api/admin/feedback/{feedback_id}")
def delete_admin_feedback(feedback_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_feedback WHERE ID = ?", (feedback_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": f"Feedback {feedback_id} deleted."}


@router.get("/api/admin/registered-users")
def get_registered_users(
    current_admin: dict = Depends(get_current_admin),
    q: str = Query(default="", description="Search by username or email"),
):
    """Fetch all actual registered users (not anonymous uploads)."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if q:
            like = f"%{q}%"
            cursor.execute(
                "SELECT id, username, email, role, is_active FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY id DESC",
                (like, like),
            )
        else:
            cursor.execute("SELECT id, username, email, role, is_active FROM users ORDER BY id DESC")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"users": [dict(r) for r in rows]}


class RoleUpdate(BaseModel):
    role: str = Field(..., pattern=r"^(admin|user)$")


@router.patch("/api/admin/registered-users/{user_id}/role")
def update_user_role(user_id: int, body: RoleUpdate, current_admin: dict = Depends(get_current_admin)):
    """Change a user's role (admin/user). Prevents removing the last admin."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user["role"] == "admin" and body.role != "admin":
            cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'")
            if cursor.fetchone()["cnt"] <= 1:
                raise HTTPException(status_code=400, detail="Cannot remove the last admin")
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (body.role, user_id))
        conn.commit()
        cursor.execute("SELECT id, username, email, role, is_active FROM users WHERE id = ?", (user_id,))
        updated = cursor.fetchone()
    finally:
        conn.close()
    log_audit_action(current_admin, "change_role", "user", user_id, f"New role: {body.role}")
    return {"status": "success", "user": dict(updated)}


class StatusUpdate(BaseModel):
    is_active: bool


@router.patch("/api/admin/registered-users/{user_id}/status")
def update_user_status(user_id: int, body: StatusUpdate, current_admin: dict = Depends(get_current_admin)):
    """Activate or deactivate a user account."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if body.is_active else 0, user_id))
        conn.commit()
        cursor.execute("SELECT id, username, email, role, is_active FROM users WHERE id = ?", (user_id,))
        updated = cursor.fetchone()
    finally:
        conn.close()
    log_audit_action(current_admin, "toggle_status", "user", user_id, f"Active: {body.is_active}")
    return {"status": "success", "user": dict(updated)}


@router.delete("/api/admin/registered-users/{user_id}")
def delete_registered_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    """Delete (ban) a registered user and cascade-delete their data."""
    # Prevent deleting the last admin
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if user and user["role"] == "admin":
            cursor.execute("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'")
            admin_count = cursor.fetchone()["admin_count"]
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot delete the last admin account")
    finally:
        conn.close()

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_data WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM user_preferences WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM shared_reports WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM login_attempts WHERE username = (SELECT username FROM users WHERE id = ?)", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()
    log_audit_action(current_admin, "delete_user", "user", user_id)
    return {"status": "success", "message": f"User {user_id} deleted."}


@router.get("/api/admin/courses")
def get_all_courses(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""SELECT id, field, course_name, course_url, description,
            instructor, rating, duration, price, platform, enrollment_count,
            last_scraped, created_at FROM courses ORDER BY field, id DESC""")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"courses": [dict(r) for r in rows]}


@router.post("/api/admin/courses")
def add_course(course: CourseInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO courses (field, course_name, course_url) VALUES (?, ?, ?)",
            (course.field, course.course_name, course.course_url)
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Course added successfully."}


@router.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Course deleted."}


@router.patch("/api/admin/courses/{course_id}")
def update_course(course_id: int, course: CourseInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM courses WHERE id = ?", (course_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Course not found")
        cursor.execute(
            "UPDATE courses SET field = ?, course_name = ?, course_url = ? WHERE id = ?",
            (course.field, course.course_name, course.course_url, course_id)
        )
        conn.commit()
        cursor.execute("SELECT id, field, course_name, course_url, created_at FROM courses WHERE id = ?", (course_id,))
        updated = cursor.fetchone()
    finally:
        conn.close()
    return {"status": "success", "course": dict(updated)}


class ScrapeRequest(BaseModel):
    fields: List[str] = Field(..., min_length=1, max_length=20)
    max_per_platform: int = Field(default=10, ge=1, le=50)


# In-memory scrape status tracking
_scrape_jobs = {}


@router.post("/api/admin/scrape-courses")
def scrape_courses(body: ScrapeRequest, current_admin: dict = Depends(get_current_admin)):
    """Trigger course scraping for specified fields."""
    job_id = f"scrape_{int(__import__('time').time())}"
    _scrape_jobs[job_id] = {"status": "running", "fields": body.fields, "results": {}}

    total_added = 0
    total_updated = 0
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        for field in body.fields:
            try:
                courses = scrape_courses_for_field(field, body.max_per_platform)
                added = 0
                updated = 0
                for course in courses:
                    # Check if course already exists by URL
                    cursor.execute("SELECT id FROM courses WHERE course_url = ?", (course["course_url"],))
                    existing = cursor.fetchone()

                    if existing:
                        # Update existing course
                        cursor.execute(
                            """UPDATE courses SET
                            course_name = ?, description = ?, instructor = ?,
                            rating = ?, duration = ?, price = ?, platform = ?,
                            enrollment_count = ?, last_scraped = CURRENT_TIMESTAMP
                            WHERE course_url = ?""",
                            (
                                course["course_name"], course["description"],
                                course["instructor"], course["rating"],
                                course["duration"], course["price"],
                                course["platform"], course["enrollment_count"],
                                course["course_url"],
                            )
                        )
                        updated += 1
                    else:
                        # Insert new course
                        cursor.execute(
                            """INSERT INTO courses
                            (field, course_name, course_url, description, instructor,
                            rating, duration, price, platform, enrollment_count, last_scraped)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                            (
                                field, course["course_name"], course["course_url"],
                                course["description"], course["instructor"],
                                course["rating"], course["duration"],
                                course["price"], course["platform"],
                                course["enrollment_count"],
                            )
                        )
                        added += 1

                conn.commit()
                total_added += added
                total_updated += updated
                _scrape_jobs[job_id]["results"][field] = {"added": added, "updated": updated}
                log_audit_action(current_admin, "scrape_courses", "field", field, f"Added: {added}, Updated: {updated}")
            except Exception as e:
                logger.error(f"Scraping failed for field '{field}': {e}")
                _scrape_jobs[job_id]["results"][field] = {"error": str(e)}
    finally:
        conn.close()

    _scrape_jobs[job_id]["status"] = "completed"
    _scrape_jobs[job_id]["summary"] = {"total_added": total_added, "total_updated": total_updated}

    return {
        "status": "success",
        "job_id": job_id,
        "total_added": total_added,
        "total_updated": total_updated,
        "results": _scrape_jobs[job_id]["results"],
    }


@router.get("/api/admin/scrape-status/{job_id}")
def get_scrape_status(job_id: str, current_admin: dict = Depends(get_current_admin)):
    """Get the status of a scraping job."""
    if job_id not in _scrape_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return _scrape_jobs[job_id]


@router.get("/api/admin/scrape-fields")
def get_scrape_fields(current_admin: dict = Depends(get_current_admin)):
    """Get list of fields that can be scraped."""
    return {"fields": list(FIELD_SEARCH_QUERIES.keys())}


@router.get("/api/admin/analytics")
def get_advanced_analytics(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Most Sought-After Role
        cursor.execute('''
            SELECT target_role, COUNT(*) as count 
            FROM user_data 
            WHERE target_role != 'Unknown' AND target_role != 'None' AND target_role != ''
            GROUP BY target_role 
            ORDER BY count DESC 
            LIMIT 1
        ''')
        top_role_row = cursor.fetchone()
        top_role = top_role_row['target_role'] if top_role_row else "Insufficient Data"
        
        # 2. Most Common Missing Skill
        cursor.execute("SELECT missing_skills FROM user_data WHERE missing_skills != ''")
        all_missing_skills_rows = cursor.fetchall()
        skill_counts = {}
        for row in all_missing_skills_rows:
            skills = [s.strip() for s in row['missing_skills'].split(',') if s.strip()]
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
                
        top_skill = "Insufficient Data"
        if skill_counts:
            top_skill = max(skill_counts, key=skill_counts.get)
    finally:
        conn.close()
    return {
        "most_sought_role": top_role,
        "most_common_missing_skill": top_skill
    }


@router.get("/api/admin/quality-metrics")
def quality_metrics(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total_requests FROM request_logs")
        total_requests = cursor.fetchone()["total_requests"]
        cursor.execute("SELECT COUNT(*) as errors FROM request_logs WHERE status_code >= 500")
        errors = cursor.fetchone()["errors"]
        cursor.execute("SELECT AVG(elapsed_ms) as avg_latency FROM request_logs")
        avg_latency = cursor.fetchone()["avg_latency"] or 0
        cursor.execute("SELECT COUNT(*) as uploads FROM user_data")
        uploads = cursor.fetchone()["uploads"]
        cursor.execute("SELECT COUNT(*) as feedback_count FROM user_feedback")
        feedback_count = cursor.fetchone()["feedback_count"]
    finally:
        conn.close()
    return {
        "total_requests": total_requests,
        "server_errors": errors,
        "avg_latency_ms": round(float(avg_latency), 2),
        "resume_uploads": uploads,
        "feedback_events": feedback_count,
        "parse_failure_rate_pct": round((errors / total_requests) * 100, 2) if total_requests else 0.0,
    }


@router.get("/api/admin/analytics/uploads-over-time")
def uploads_over_time(current_admin: dict = Depends(get_current_admin)):
    """Resume uploads grouped by date for the last 30 days."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DATE(Timestamp) as date, COUNT(*) as count
            FROM user_data
            WHERE Timestamp IS NOT NULL AND Timestamp != ''
            GROUP BY DATE(Timestamp)
            ORDER BY date DESC
            LIMIT 30
        """)
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"data": [dict(r) for r in reversed(rows)]}


@router.get("/api/admin/analytics/skill-gaps")
def skill_gaps(current_admin: dict = Depends(get_current_admin)):
    """Top missing skills across all analyses."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT missing_skills FROM user_data WHERE missing_skills != ''")
        rows = cursor.fetchall()
        skill_counts = {}
        for row in rows:
            skills = [s.strip() for s in row["missing_skills"].split(",") if s.strip()]
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
        top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    finally:
        conn.close()
    return {"data": [{"skill": s, "count": c} for s, c in top_skills]}


@router.get("/api/admin/analytics/role-distribution")
def role_distribution(current_admin: dict = Depends(get_current_admin)):
    """Distribution of target roles chosen by users."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT target_role, COUNT(*) as count
            FROM user_data
            WHERE target_role != 'Unknown' AND target_role != 'None' AND target_role != ''
            GROUP BY target_role
            ORDER BY count DESC
            LIMIT 10
        """)
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"data": [dict(r) for r in rows]}


@router.get("/api/admin/analytics/user-growth")
def user_growth(current_admin: dict = Depends(get_current_admin)):
    """User registrations grouped by date."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at IS NOT NULL
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        """)
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"data": [dict(r) for r in reversed(rows)]}


@router.get("/api/admin/analysis-cache")
def get_analysis_cache(
    current_admin: dict = Depends(get_current_admin),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """List cached analysis results."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT content_hash, target_role, created_at, expires_at FROM analysis_cache ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) as total FROM analysis_cache")
        total = cursor.fetchone()["total"]
    finally:
        conn.close()
    return {"cache": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


@router.delete("/api/admin/analysis-cache/{content_hash}/{target_role}")
def delete_analysis_cache(content_hash: str, target_role: str, current_admin: dict = Depends(get_current_admin)):
    """Delete a specific analysis cache entry."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analysis_cache WHERE content_hash = ? AND target_role = ?", (content_hash, target_role))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Cache entry deleted."}


@router.get("/api/admin/api-usage")
def api_usage(current_admin: dict = Depends(get_current_admin)):
    """API usage statistics grouped by path."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT path, method, COUNT(*) as count, AVG(elapsed_ms) as avg_ms
            FROM request_logs
            GROUP BY path, method
            ORDER BY count DESC
            LIMIT 20
        """)
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"data": [dict(r) for r in rows]}


class JobRoleInput(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(default="")
    category: str = Field(default="")
    skills: list[str] = Field(default=[])


@router.get("/api/admin/job-roles")
def get_job_roles(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, description, category, is_active, created_at FROM job_roles ORDER BY title")
        roles = cursor.fetchall()
        result = []
        for role in roles:
            role_dict = dict(role)
            cursor.execute("SELECT id, skill_name, is_required FROM job_role_skills WHERE job_role_id = ?", (role["id"],))
            role_dict["skills"] = [dict(s) for s in cursor.fetchall()]
            cursor.execute("SELECT COUNT(*) as count FROM career_roadmaps WHERE job_role_id = ?", (role["id"],))
            role_dict["roadmap_count"] = cursor.fetchone()["count"]
            result.append(role_dict)
    finally:
        conn.close()
    return {"job_roles": result}


@router.post("/api/admin/job-roles")
def create_job_role(body: JobRoleInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO job_roles (title, description, category) VALUES (?, ?, ?)",
            (body.title, body.description, body.category)
        )
        role_id = cursor.lastrowid
        for skill in body.skills:
            cursor.execute(
                "INSERT INTO job_role_skills (job_role_id, skill_name, is_required) VALUES (?, ?, 1)",
                (role_id, skill)
            )
        conn.commit()
        cursor.execute("SELECT id, title, description, category, is_active, created_at FROM job_roles WHERE id = ?", (role_id,))
        role = dict(cursor.fetchone())
        cursor.execute("SELECT id, skill_name, is_required FROM job_role_skills WHERE job_role_id = ?", (role_id,))
        role["skills"] = [dict(s) for s in cursor.fetchall()]
        role["roadmap_count"] = 0
    finally:
        conn.close()
    return {"status": "success", "job_role": role}


@router.patch("/api/admin/job-roles/{role_id}")
def update_job_role(role_id: int, body: JobRoleInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_roles WHERE id = ?", (role_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job role not found")
        cursor.execute(
            "UPDATE job_roles SET title = ?, description = ?, category = ? WHERE id = ?",
            (body.title, body.description, body.category, role_id)
        )
        cursor.execute("DELETE FROM job_role_skills WHERE job_role_id = ?", (role_id,))
        for skill in body.skills:
            cursor.execute(
                "INSERT INTO job_role_skills (job_role_id, skill_name, is_required) VALUES (?, ?, 1)",
                (role_id, skill)
            )
        conn.commit()
        cursor.execute("SELECT id, title, description, category, is_active, created_at FROM job_roles WHERE id = ?", (role_id,))
        role = dict(cursor.fetchone())
        cursor.execute("SELECT id, skill_name, is_required FROM job_role_skills WHERE job_role_id = ?", (role_id,))
        role["skills"] = [dict(s) for s in cursor.fetchall()]
        cursor.execute("SELECT COUNT(*) as count FROM career_roadmaps WHERE job_role_id = ?", (role_id,))
        role["roadmap_count"] = cursor.fetchone()["count"]
    finally:
        conn.close()
    return {"status": "success", "job_role": role}


@router.patch("/api/admin/job-roles/{role_id}/status")
def toggle_job_role_status(role_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, is_active FROM job_roles WHERE id = ?", (role_id,))
        role = cursor.fetchone()
        if not role:
            raise HTTPException(status_code=404, detail="Job role not found")
        new_status = 0 if role["is_active"] else 1
        cursor.execute("UPDATE job_roles SET is_active = ? WHERE id = ?", (new_status, role_id))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "is_active": new_status}


@router.delete("/api/admin/job-roles/{role_id}")
def delete_job_role(role_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_roles WHERE id = ?", (role_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job role not found")
        cursor.execute("DELETE FROM job_roles WHERE id = ?", (role_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Job role deleted."}


class RoadmapInput(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(default="")
    duration_weeks: int = Field(default=12)
    steps: list[dict] = Field(default=[])


@router.get("/api/admin/job-roles/{role_id}/roadmaps")
def get_roadmaps(role_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_roles WHERE id = ?", (role_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job role not found")
        cursor.execute(
            "SELECT id, job_role_id, title, description, duration_weeks, sort_order, created_at FROM career_roadmaps WHERE job_role_id = ? ORDER BY sort_order",
            (role_id,)
        )
        roadmaps = []
        for rm in cursor.fetchall():
            rm_dict = dict(rm)
            cursor.execute(
                "SELECT id, step_number, title, description, duration_weeks, skills, resources FROM roadmap_steps WHERE roadmap_id = ? ORDER BY step_number",
                (rm["id"],)
            )
            rm_dict["steps"] = [dict(s) for s in cursor.fetchall()]
            roadmaps.append(rm_dict)
    finally:
        conn.close()
    return {"roadmaps": roadmaps}


@router.post("/api/admin/job-roles/{role_id}/roadmaps")
def create_roadmap(role_id: int, body: RoadmapInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_roles WHERE id = ?", (role_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job role not found")
        cursor.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM career_roadmaps WHERE job_role_id = ?", (role_id,))
        next_order = cursor.fetchone()[0]
        cursor.execute(
            "INSERT INTO career_roadmaps (job_role_id, title, description, duration_weeks, sort_order) VALUES (?, ?, ?, ?, ?)",
            (role_id, body.title, body.description, body.duration_weeks, next_order)
        )
        roadmap_id = cursor.lastrowid
        for i, step in enumerate(body.steps, 1):
            cursor.execute(
                "INSERT INTO roadmap_steps (roadmap_id, step_number, title, description, duration_weeks, skills, resources) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (roadmap_id, i, step.get("title", ""), step.get("description", ""), step.get("duration_weeks", 2), step.get("skills", ""), step.get("resources", ""))
            )
        conn.commit()
        cursor.execute("SELECT id, job_role_id, title, description, duration_weeks, sort_order, created_at FROM career_roadmaps WHERE id = ?", (roadmap_id,))
        rm = dict(cursor.fetchone())
        cursor.execute("SELECT id, step_number, title, description, duration_weeks, skills, resources FROM roadmap_steps WHERE roadmap_id = ? ORDER BY step_number", (roadmap_id,))
        rm["steps"] = [dict(s) for s in cursor.fetchall()]
    finally:
        conn.close()
    return {"status": "success", "roadmap": rm}


@router.delete("/api/admin/roadmaps/{roadmap_id}")
def delete_roadmap(roadmap_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM career_roadmaps WHERE id = ?", (roadmap_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Roadmap deleted."}


@router.get("/api/admin/audit-logs")
def get_audit_logs(
    current_admin: dict = Depends(get_current_admin),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """List audit logs of admin actions."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, admin_username, action, target_type, target_id, details, ip_address, created_at FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) as total FROM audit_logs")
        total = cursor.fetchone()["total"]
    finally:
        conn.close()
    return {"logs": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


class PasswordResetInput(BaseModel):
    user_id: int
    new_password: str = Field(..., min_length=8)


@router.post("/api/admin/reset-password")
def admin_reset_password(body: PasswordResetInput, current_admin: dict = Depends(get_current_admin)):
    """Admin reset a user's password."""
    from api.security import get_password_hash
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username FROM users WHERE id = ?", (body.user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        hashed = get_password_hash(body.new_password)
        cursor.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (hashed, body.user_id))
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id = ?", (body.user_id,))
        conn.commit()
    finally:
        conn.close()
    log_audit_action(current_admin, "reset_password", "user", body.user_id)
    return {"status": "success", "message": f"Password reset for {user['username']}."}


@router.get("/api/admin/export/{table_name}")
def export_table(table_name: str, current_admin: dict = Depends(get_current_admin)):
    """Export a table as JSON."""
    allowed_tables = [
        "users", "user_data", "courses", "user_feedback", "job_roles", "audit_logs",
        "skill_categories", "skills", "role_synonyms", "skill_aliases",
        "field_keywords", "industry_trends", "market_role_aliases",
        "skill_recommendations", "roadmap_templates", "learning_actions",
        "learning_resources", "skill_difficulty", "skill_clusters",
        "video_resources", "role_configs",
    ]
    if table_name not in allowed_tables:
        raise HTTPException(status_code=400, detail=f"Cannot export table: {table_name}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 1000")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"table": table_name, "count": len(rows), "data": [dict(r) for r in rows]}


# ============================================================
# Taxonomy data view endpoints
# ============================================================

@router.get("/api/admin/taxonomy/overview")
def get_taxonomy_overview(current_admin: dict = Depends(get_current_admin)):
    """Get overview of all taxonomy tables."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        tables = {
            "skill_categories": "SELECT COUNT(*) as count FROM skill_categories",
            "skills": "SELECT COUNT(*) as count FROM skills",
            "role_synonyms": "SELECT COUNT(*) as count FROM role_synonyms",
            "skill_aliases": "SELECT COUNT(*) as count FROM skill_aliases",
            "field_keywords": "SELECT COUNT(*) as count FROM field_keywords",
            "industry_trends": "SELECT COUNT(*) as count FROM industry_trends",
            "market_role_aliases": "SELECT COUNT(*) as count FROM market_role_aliases",
            "skill_recommendations": "SELECT COUNT(*) as count FROM skill_recommendations",
            "roadmap_templates": "SELECT COUNT(*) as count FROM roadmap_templates",
            "learning_actions": "SELECT COUNT(*) as count FROM learning_actions",
            "learning_resources": "SELECT COUNT(*) as count FROM learning_resources",
            "skill_difficulty": "SELECT COUNT(*) as count FROM skill_difficulty",
            "skill_clusters": "SELECT COUNT(*) as count FROM skill_clusters",
            "video_resources": "SELECT COUNT(*) as count FROM video_resources",
            "role_configs": "SELECT COUNT(*) as count FROM role_configs",
        }
        result = {}
        for table, query in tables.items():
            cursor.execute(query)
            result[table] = cursor.fetchone()["count"]
        return result
    finally:
        conn.close()


@router.get("/api/admin/taxonomy/skills")
def get_taxonomy_skills(current_admin: dict = Depends(get_current_admin)):
    """Get all skills organized by category."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sc.name as category, s.name as skill
            FROM skill_categories sc
            JOIN skills s ON sc.id = s.category_id
            ORDER BY sc.sort_order, s.sort_order
        """)
        result = {}
        for row in cursor.fetchall():
            if row["category"] not in result:
                result[row["category"]] = []
            result[row["category"]].append(row["skill"])
        return result
    finally:
        conn.close()


@router.get("/api/admin/taxonomy/roadmaps")
def get_taxonomy_roadmaps(current_admin: dict = Depends(get_current_admin)):
    """Get all roadmap templates."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT field_name, step_number, title, duration, skills
            FROM roadmap_templates
            ORDER BY field_name, step_number
        """)
        result = {}
        for row in cursor.fetchall():
            if row["field_name"] not in result:
                result[row["field_name"]] = []
            result[row["field_name"]].append({
                "step": row["step_number"],
                "title": row["title"],
                "duration": row["duration"],
                "skills": json.loads(row["skills"]),
            })
        return result
    finally:
        conn.close()


@router.get("/api/admin/taxonomy/role-configs")
def get_taxonomy_role_configs(current_admin: dict = Depends(get_current_admin)):
    """Get all role configurations."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM role_configs ORDER BY role_key")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


@router.get("/api/admin/taxonomy/video-resources")
def get_taxonomy_video_resources(
    video_type: Optional[str] = Query(None),
    current_admin: dict = Depends(get_current_admin)
):
    """Get video resources, optionally filtered by type."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if video_type:
            cursor.execute(
                "SELECT * FROM video_resources WHERE video_type = ? ORDER BY field_name, sort_order",
                (video_type,)
            )
        else:
            cursor.execute("SELECT * FROM video_resources ORDER BY field_name, video_type, sort_order")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()
