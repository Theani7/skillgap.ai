from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, HttpUrl
import os
import secrets
import time
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional

from api.database import get_db_connection
from api.extractor import (
    rewrite_resume_with_gemini,
    simulate_interview_turn,
)
from api.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_current_admin,
    get_current_optional_user,
    get_current_user_from_cookie,
    COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    hash_token,
)
from api.security import get_password_hash, verify_password
from api.scraper import simulate_trend_update, get_scraper_status
from api.career_services import (
    generate_interview_questions,
    rank_candidates,
    rewrite_resume_bullets_fallback,
)
from api.job_hunt_services import (
    compare_resume_to_jd,
    recommend_projects,
    get_translations,
    rewrite_resume_fallback,
    generate_roadmap_fallback,
)
from api.exceptions import SkillGapException
from api.mock_interview import router as mock_interview_router
from api.routes.auth import router as auth_router
from api.routes.analysis import router as analysis_router
import json

# ---------------------------------------------------------------------------
# Startup env validation – fail fast with clear messages
# ---------------------------------------------------------------------------
def _validate_env():
    errors = []

    env = os.getenv("ENV", "development").lower()
    is_prod = env in ("production", "prod")

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key or gemini_key == "test-key":
        if is_prod:
            errors.append("GEMINI_API_KEY is required in production.")
        else:
            logger.warning("GEMINI_API_KEY is missing or dummy – Gemini analysis will be unavailable.")

    jwt_secret = os.getenv("JWT_SECRET_KEY", "")
    if not jwt_secret or len(jwt_secret) < 32:
        if is_prod:
            errors.append("JWT_SECRET_KEY must be >= 32 characters in production.")
        else:
            logger.warning("JWT_SECRET_KEY is missing or short – using random key (sessions reset on restart).")

    db_file = os.getenv("DB_FILE") or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "cv.db"
    )
    db_dir = os.path.dirname(db_file) or "."
    if not os.access(db_dir, os.W_OK):
        errors.append(f"DB_FILE directory is not writable: {db_dir}")

    cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    if is_prod and "*" in cors_raw:
        errors.append("CORS_ORIGINS must not include '*' in production.")

    if errors:
        msg = "Startup validation failed:\n  - " + "\n  - ".join(errors)
        logger.error(msg)
        raise RuntimeError(msg)

# ---------------------------------------------------------------------------

app = FastAPI(title="AI Resume Analyzer API")

@app.exception_handler(SkillGapException)
async def skillgap_exception_handler(request: Request, exc: SkillGapException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "code": exc.code,
            "status": "error"
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "code": f"HTTP_{exc.status_code}",
            "status": "error"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "An unexpected error occurred. Our engineers have been notified.",
            "code": "INTERNAL_SERVER_ERROR",
            "status": "error"
        }
    )

app.include_router(mock_interview_router)
app.include_router(auth_router)
app.include_router(analysis_router)

logger = logging.getLogger("resume-analyzer")
logging.basicConfig(level=logging.INFO)

_validate_env()

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
RESET_COOLDOWN_SECONDS = 5 * 60
ENV = os.getenv("ENV", "development").lower()
IS_PROD = ENV in ("production", "prod")

_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
CORS_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip() and o.strip() != "*"]
if IS_PROD and "*" in _raw_origins:
    raise RuntimeError("CORS_ORIGINS must not include '*' in production.")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Cookie"],
    max_age=600,
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none'; "
        "base-uri 'self';"
    )
    return response

class UserProfileUpdate(BaseModel):
    full_name: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=20)
    location: str = Field(default="", max_length=200)
    bio: str = Field(default="", max_length=500)
    current_role: str = Field(default="", max_length=100)
    experience_years: str = Field(default="", max_length=10)
    linkedin_url: str = Field(default="", max_length=500)
    github_url: str = Field(default="", max_length=500)


class JobMatchRequest(BaseModel):
    target_role: str = Field(..., max_length=200)
    skills: list[str] = Field(default_factory=list, max_length=200)
    missing_skills: list[str] = Field(default_factory=list, max_length=200)


class InterviewRequest(BaseModel):
    target_role: str = Field(..., max_length=200)
    skills: list[str] = Field(default_factory=list, max_length=200)
    missing_skills: list[str] = Field(default_factory=list, max_length=200)


class InterviewSimulatorRequest(BaseModel):
    resume_data: dict
    target_role: str = Field(..., max_length=200)
    chat_history: list[dict] = Field(default_factory=list, max_length=50)


class RewriteRequest(BaseModel):
    target_role: Optional[str] = Field(default=None, max_length=200)
    resume_data: dict


class CandidateRankRequest(BaseModel):
    target_role: str = Field(..., max_length=200)
    candidates: list[dict] = Field(..., max_length=200)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., max_length=200)
    new_password: str = Field(..., min_length=8, max_length=128)


class JDCompareRequest(BaseModel):
    resume_skills: list[str] = Field(default_factory=list, max_length=200)
    job_description: str = Field(..., max_length=20000)


class ProjectRecommendationRequest(BaseModel):
    target_role: str = Field(..., max_length=200)
    missing_skills: list[str] = Field(default_factory=list, max_length=200)


class ShareReportRequest(BaseModel):
    analysis_id: int = Field(..., gt=0)
    expires_in_hours: int = Field(default=72, ge=1, le=8760)
    is_public: bool = False


class PreferencesInput(BaseModel):
    target_role: str = Field(default="", max_length=200)
    timeline_months: int = Field(default=6, ge=1, le=120)
    preferred_location: str = Field(default="", max_length=200)
    salary_target: int = Field(default=0, ge=0, le=10_000_000)
    locale: str = Field(default="en", max_length=10)


class BillingSubscribeRequest(BaseModel):
    plan: str = Field(..., pattern=r'^(free|pro|enterprise)$')


class NotificationInput(BaseModel):
    channel: str = Field(default="email", pattern=r'^(email|push|sms)$')
    message: str = Field(..., min_length=1, max_length=500)
    send_at: int = Field(default=0, ge=0)


class TranslationRequest(BaseModel):
    locale: str = Field(default="en", max_length=10)


def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@app.middleware("http")
async def request_logging_and_rate_limit(request: Request, call_next):
    client_ip = _client_ip(request)
    now_minute = int(time.time() // 60)
    bucket_key = f"{client_ip}:{now_minute}"

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM rate_limits WHERE updated_at < ?", (now_minute,))
        cursor.execute(
            "INSERT INTO rate_limits (key, count, updated_at) VALUES (?, 1, ?) "
            "ON CONFLICT(key) DO UPDATE SET count = count + 1, updated_at = ?",
            (bucket_key, now_minute, now_minute),
        )
        cursor.execute("SELECT count FROM rate_limits WHERE key = ?", (bucket_key,))
        row = cursor.fetchone()
        count = row["count"] if row else 1
        conn.commit()
        if count > RATE_LIMIT_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rate limit error: {e}")
        conn.rollback()
    finally:
        conn.close()

    start = time.perf_counter()
    request_id = str(uuid.uuid4())
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        json.dumps(
            {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "elapsed_ms": elapsed_ms,
            }
        )
    )
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO request_logs(request_id, method, path, status_code, elapsed_ms) VALUES (?, ?, ?, ?, ?)",
            (request_id, request.method, request.url.path, response.status_code, elapsed_ms),
        )
        conn.commit()
    except Exception as log_err:
        logger.warning(f"Failed to log request: {log_err}")
    finally:
        try:
            conn.close()
        except Exception:
            pass
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
    return response

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}


@app.get("/api/health")
def health_check():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
    finally:
        conn.close()
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.get("/api/trends/status")
def get_trends_status():
    """Returns the last scraped timestamp and current active skills."""
    return get_scraper_status()

@app.post("/api/admin/trigger-scrape")
def trigger_simulated_scrape(current_admin: dict = Depends(get_current_admin)):
    """Allows an admin to manually trigger a simulated market shift."""
    result = simulate_trend_update()
    return result

@app.get("/api/admin/users")
def get_admin_users(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_data ORDER BY ID DESC")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"users": [dict(r) for r in rows]}

@app.get("/api/admin/feedback")
def get_admin_feedback(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_feedback ORDER BY ID DESC")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"feedback": [dict(r) for r in rows]}

@app.delete("/api/admin/users/{user_id}")
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

@app.delete("/api/admin/feedback/{feedback_id}")
def delete_admin_feedback(feedback_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_feedback WHERE ID = ?", (feedback_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": f"Feedback {feedback_id} deleted."}


# --- NEW ADMIN ROUTES (User Management, Course Management, Analytics) ---

@app.get("/api/admin/registered-users")
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

@app.delete("/api/admin/registered-users/{user_id}")
def delete_registered_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    """Delete (ban) a registered user and cascade-delete their data."""
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

class CourseInput(BaseModel):
    field: str
    course_name: str
    course_url: str

@app.get("/api/admin/courses")
def get_all_courses(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses ORDER BY field, id DESC")
        rows = cursor.fetchall()
    finally:
        conn.close()
    return {"courses": [dict(r) for r in rows]}

@app.post("/api/admin/courses")
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

@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Course deleted."}

@app.get("/api/admin/analytics")
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
    
@app.get("/api/user/latest-analysis")
def get_latest_analysis(current_user: dict = Depends(get_current_user)):
    """
    Return the most recent saved analysis for the logged-in user.
    Reads from the user_data table only - never re-invokes the AI.
    Use this to render the persistent "My Analysis" view in the sidebar
    without consuming Gemini tokens.
    """
    if not current_user or 'id' not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized request")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            '''
            SELECT ID, Timestamp, Predicted_Field, resume_score, target_role,
                   missing_skills, Actual_skills, Recommended_skills,
                   pdf_name, analysis_data
            FROM user_data
            WHERE user_id = ?
            ORDER BY ID DESC
            LIMIT 1
            ''',
            (current_user['id'],),
        )
        row = cursor.fetchone()
    finally:
        conn.close()

    if not row:
        return {"found": False}

    payload = None
    if row['analysis_data']:
        try:
            payload = json.loads(row['analysis_data'])
        except (json.JSONDecodeError, TypeError):
            payload = None

    if payload is None:
        # Old rows without full analysis_data JSON - synthesize from columns
        payload = {
            "status": "success",
            "data": {
                "name": "",
                "email": "",
                "skills": row['Actual_skills'].split(',') if row['Actual_skills'] else [],
                "no_of_pages": 1,
            },
            "target_role": row['target_role'],
            "predicted_field": row['Predicted_Field'],
            "resume_score": float(row['resume_score']) if row['resume_score'] else 0,
            "missing_skill_names": row['missing_skills'].split(',') if row['missing_skills'] else [],
            "missing_skills": [],
            "feedback": [],
            "videos": {"resume": [], "interview": [], "tutorials": []},
            "roadmap": [],
            "trends": None,
            "score_breakdown": {},
        }

    return {
        "found": True,
        "id": row['ID'],
        "timestamp": row['Timestamp'],
        "pdf_name": row['pdf_name'],
        "predicted_field": row['Predicted_Field'],
        "target_role": row['target_role'],
        "resume_score": float(row['resume_score']) if row['resume_score'] else 0,
        "analysis": payload,
    }


@app.get("/api/user/history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    """Fetch all past resume analyses for the logged-in user."""
    if not current_user or 'id' not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized request")
        
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT ID, Timestamp, Predicted_Field, resume_score, target_role, missing_skills, Actual_skills, Recommended_skills, analysis_data
            FROM user_data
            WHERE user_id = ?
            ORDER BY ID DESC
        ''', (current_user['id'],))
        rows = cursor.fetchall()
    finally:
        conn.close()
    
    # Format the data for the frontend
    history = []
    for row in rows:
        analysis_data = None
        if row['analysis_data']:
            try:
                analysis_data = json.loads(row['analysis_data'])
            except json.JSONDecodeError:
                pass
                
        history.append({
            "id": row['ID'],
            "timestamp": row['Timestamp'],
            "predicted_field": row['Predicted_Field'],
            "target_role": row['target_role'],
            "resume_score": float(row['resume_score']) if row['resume_score'] else 0,
            "missing_skills": row['missing_skills'].split(',') if row['missing_skills'] else [],
            "actual_skills": row['Actual_skills'].split(',') if row['Actual_skills'] else [],
            "recommended_skills": row['Recommended_skills'].split(',') if row['Recommended_skills'] else [],
            "analysis_data": analysis_data
        })
        
    return {"history": history}


@app.delete("/api/user/history")
def delete_user_history(current_user: dict = Depends(get_current_user)):
    """Delete all past resume analyses for the logged-in user."""
    if not current_user or 'id' not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized request")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_data WHERE user_id = ?", (current_user['id'],))
        deleted = cursor.rowcount
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "deleted": deleted}


@app.delete("/api/user/analysis/{analysis_id}")
def delete_user_analysis(analysis_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a single analysis by ID. Ownership-checked."""
    if not current_user or 'id' not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized request")
    if not isinstance(analysis_id, int) or analysis_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid analysis id")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM user_data WHERE ID = ? AND user_id = ?",
            (analysis_id, current_user['id']),
        )
        deleted = cursor.rowcount
        conn.commit()
    finally:
        conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"status": "success", "deleted": deleted}


@app.post("/api/auth/request-password-reset")
def request_password_reset(payload: PasswordResetRequest, request: Request):
    _check_strict_rate_limit(f"pwd-reset:{_client_ip(request)}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email,))
        user = cursor.fetchone()
        if user:
            cooldown_cutoff = int(time.time()) - RESET_COOLDOWN_SECONDS
            cursor.execute(
                "SELECT created_at FROM password_reset_tokens WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                (user["id"],),
            )
            last = cursor.fetchone()
            if last:
                try:
                    last_ts = int(datetime.fromisoformat(str(last["created_at"]).replace(" ", "T")).timestamp())
                except (ValueError, TypeError):
                    last_ts = 0
                if last_ts and last_ts > cooldown_cutoff:
                    return {"status": "success", "message": "If the email exists, a reset flow has been created."}
            token = secrets.token_urlsafe(32)
            expires_at = int(time.time()) + (60 * 30)
            cursor.execute(
                "INSERT OR REPLACE INTO password_reset_tokens(token, user_id, expires_at, used) VALUES (?, ?, ?, 0)",
                (token, user["id"], expires_at),
            )
            conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "If the email exists, a reset flow has been created."}


@app.post("/api/auth/reset-password")
def reset_password(payload: PasswordResetConfirm):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT token, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?",
            (payload.token,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid token")
        if int(row["used"]) == 1 or int(row["expires_at"]) < int(time.time()):
            raise HTTPException(status_code=400, detail="Token expired or already used")

        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE id = ?",
            (get_password_hash(payload.new_password), row["user_id"]),
        )
        cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", (payload.token,))
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id = ?", (row["user_id"],))
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Password reset successful"}


@app.post("/api/jobs/matches")
def get_job_matches(payload: JobMatchRequest, current_user: dict = Depends(get_current_optional_user)):
    jobs = generate_job_matches(payload.target_role, payload.skills, payload.missing_skills)
    return {"target_role": payload.target_role, "jobs": jobs}


@app.post("/api/interview/copilot")
def interview_copilot(payload: InterviewRequest, current_user: dict = Depends(get_current_optional_user)):
    questions = generate_interview_questions(payload.target_role, payload.missing_skills, payload.skills)
    return {"target_role": payload.target_role, "questions": questions}


@app.post("/api/interview/simulate")
def interview_simulator(payload: InterviewSimulatorRequest, current_user: dict = Depends(get_current_optional_user)):
    result = simulate_interview_turn(payload.resume_data, payload.target_role, payload.chat_history)
    return result

@app.post("/api/rewrite-resume")
def rewrite_resume(payload: RewriteRequest, current_user: dict = Depends(get_current_optional_user)):
    try:
        rewritten = rewrite_resume_with_gemini(payload.resume_data, payload.target_role)
    except Exception as e:
        logger.warning(f"Gemini rewrite failed, using fallback: {e}")
        rewritten = rewrite_resume_fallback(payload.resume_data, payload.target_role)
    if not rewritten:
        rewritten = rewrite_resume_bullets_fallback(payload.resume_data, payload.target_role or "General")
    return rewritten


@app.post("/api/team/rank-candidates")
def team_rank_candidates(payload: CandidateRankRequest, current_user: dict = Depends(get_current_user)):
    ranked = rank_candidates(payload.candidates, payload.target_role)
    return {"target_role": payload.target_role, "ranked_candidates": ranked}


@app.post("/api/jd/compare")
def compare_jd(payload: JDCompareRequest, current_user: dict = Depends(get_current_optional_user)):
    result = compare_resume_to_jd(payload.resume_skills, payload.job_description)
    return result


@app.post("/api/projects/recommend")
def project_recommendations(payload: ProjectRecommendationRequest, current_user: dict = Depends(get_current_optional_user)):
    projects = recommend_projects(payload.target_role, payload.missing_skills)
    return {"target_role": payload.target_role, "projects": projects}


@app.post("/api/reports/share")
def create_share_link(payload: ShareReportRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM user_data WHERE ID = ? AND user_id = ?",
            (payload.analysis_id, current_user["id"]),
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Analysis not found")
        token = secrets.token_urlsafe(24)
        expires_at = int(time.time()) + (payload.expires_in_hours * 3600)
        cursor.execute(
            """
            INSERT INTO shared_reports(token, user_id, analysis_id, expires_at, is_public)
            VALUES (?, ?, ?, ?, ?)
            """,
            (token, current_user["id"], payload.analysis_id, expires_at, int(payload.is_public)),
        )
        conn.commit()
    finally:
        conn.close()
    return {"share_token": token, "expires_at": expires_at}


@app.get("/api/reports/share/{token}")
def get_shared_report(token: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shared_reports WHERE token = ?", (token,))
        share = cursor.fetchone()
        if not share:
            raise HTTPException(status_code=404, detail="Share link not found")
        if int(share["expires_at"]) < int(time.time()):
            raise HTTPException(status_code=410, detail="Share link expired")
        cursor.execute("SELECT analysis_data FROM user_data WHERE ID = ?", (share["analysis_id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    try:
        payload = json.loads(row["analysis_data"])
    except Exception:
        payload = {}
    return {"analysis": payload, "shared": True}


@app.get("/api/user/profile")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (current_user["id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    return {"profile": dict(row) if row else {}}

@app.put("/api/user/profile")
def update_user_profile(profile: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO user_profiles(user_id, full_name, phone, location, bio, current_role, experience_years, linkedin_url, github_url, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                full_name = excluded.full_name,
                phone = excluded.phone,
                location = excluded.location,
                bio = excluded.bio,
                current_role = excluded.current_role,
                experience_years = excluded.experience_years,
                linkedin_url = excluded.linkedin_url,
                github_url = excluded.github_url,
                updated_at = CURRENT_TIMESTAMP
            """,
            (current_user["id"], profile.full_name, profile.phone, profile.location, profile.bio, 
             profile.current_role, profile.experience_years, profile.linkedin_url, profile.github_url)
        )
        conn.commit()
    finally:
        conn.close()
    return {"message": "Profile updated successfully"}

@app.get("/api/user/preferences")
def get_preferences(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (current_user["id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    return {"preferences": dict(row) if row else {}}


@app.put("/api/user/preferences")
def update_preferences(payload: PreferencesInput, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO user_preferences(user_id, target_role, timeline_months, preferred_location, salary_target, locale, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                target_role = excluded.target_role,
                timeline_months = excluded.timeline_months,
                preferred_location = excluded.preferred_location,
                salary_target = excluded.salary_target,
                locale = excluded.locale,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                current_user["id"],
                payload.target_role,
                payload.timeline_months,
                payload.preferred_location,
                payload.salary_target,
                payload.locale,
            ),
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "success"}


@app.get("/api/billing/plans")
def get_billing_plans():
    return {
        "plans": [
            {"id": "free", "price_usd_month": 0, "features": ["Basic analysis", "Limited job matches"]},
            {"id": "pro", "price_usd_month": 19, "features": ["Advanced rewrite", "Interview packs", "Team ranking"]},
            {"id": "enterprise", "price_usd_month": 99, "features": ["Recruiter workspace", "Priority support", "Analytics exports"]},
        ]
    }


@app.post("/api/billing/subscribe")
def subscribe_plan(payload: BillingSubscribeRequest, current_user: dict = Depends(get_current_user)):
    allowed = {"free", "pro", "enterprise"}
    if payload.plan not in allowed:
        raise HTTPException(status_code=400, detail="Invalid plan")
    renews_at = int(time.time()) + (30 * 24 * 3600)
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO subscriptions(user_id, plan, status, renews_at, updated_at)
            VALUES (?, ?, 'active', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                plan = excluded.plan,
                status = 'active',
                renews_at = excluded.renews_at,
                updated_at = CURRENT_TIMESTAMP
            """,
            (current_user["id"], payload.plan, renews_at),
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "plan": payload.plan, "renews_at": renews_at}


@app.get("/api/billing/subscription")
def get_subscription(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM subscriptions WHERE user_id = ?", (current_user["id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    if not row:
        return {"subscription": {"plan": "free", "status": "active"}}
    return {"subscription": dict(row)}


@app.post("/api/notifications")
def create_notification(payload: NotificationInput, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notifications(user_id, channel, message, status, send_at) VALUES (?, ?, ?, 'pending', ?)",
            (current_user["id"], payload.channel, payload.message, payload.send_at),
        )
        notification_id = cursor.lastrowid
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "notification_id": notification_id}


@app.get("/api/notifications")
def list_notifications(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", (current_user["id"],))
        rows = [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()
    return {"notifications": rows}


@app.post("/api/notifications/{notification_id}/send")
def send_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notifications SET status = 'sent' WHERE id = ? AND user_id = ?",
            (notification_id, current_user["id"]),
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Notification marked as sent"}


@app.post("/api/i18n/translations")
def get_i18n_translations(payload: TranslationRequest):
    return {"locale": payload.locale, "translations": get_translations(payload.locale)}


@app.get("/api/admin/quality-metrics")
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
