import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from api.auth import get_current_admin
from api.database import get_db_connection
from api.scraper import simulate_trend_update

logger = logging.getLogger("resume-analyzer")

router = APIRouter(tags=["admin"])


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
            SELECT ID, user_id, Timestamp, Predicted_Field, resume_score,
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
            "SELECT ID, name, email, score, comments, created_at FROM user_feedback ORDER BY ID DESC LIMIT ? OFFSET ?",
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
        cursor.execute("DELETE FROM user_data WHERE ID = ?", (user_id,))
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
def get_registered_users(current_admin: dict = Depends(get_current_admin)):
    """Fetch all actual registered users (not anonymous uploads)."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, role FROM users ORDER BY id DESC")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"users": [dict(r) for r in rows]}


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
    return {"status": "success", "message": f"User {user_id} deleted."}


@router.get("/api/admin/courses")
def get_all_courses(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, field, course_name, course_url, created_at FROM courses ORDER BY field, id DESC")
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
