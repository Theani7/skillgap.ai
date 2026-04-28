from fastapi import FastAPI, File, UploadFile, Depends, Form, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
import sqlite3
import os
import secrets
import tempfile
import time
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
import re

from api.database import get_db_connection
from api.extractor import parse_resume_with_gemini, rewrite_resume_with_gemini, generate_cover_letter_with_gemini
from api.courses import ds_course, web_course, android_course, ios_course, uiux_course
from api.auth import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token, get_current_user, get_current_admin, get_current_optional_user, get_current_user_from_cookie, COOKIE_NAME
from api.scraper import simulate_trend_update, get_scraper_status
from api.market_data import get_market_trends_for_role
from api.career_services import (
    compute_resume_score_breakdown,
    generate_job_matches,
    generate_interview_questions,
    rank_candidates,
    rewrite_resume_bullets_fallback,
)
from api.job_hunt_services import (
    compare_resume_to_jd,
    generate_cover_letter_fallback,
    recommend_projects,
    get_translations,
    parse_resume_fallback,
    rewrite_resume_fallback,
    generate_roadmap_fallback,
)
import json

app = FastAPI(title="AI Resume Analyzer API")
logger = logging.getLogger("resume-analyzer")
logging.basicConfig(level=logging.INFO)
RATE_BUCKET = {}
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))

MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 15
FAILED_LOGIN_ATTEMPTS = {}

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Cookie"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    return response

class Feedback(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    score: str = Field(..., pattern=r'^\d+$')
    comments: str = ""

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=100)

class UserProfileUpdate(BaseModel):
    full_name: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=20)
    location: str = Field(default="", max_length=200)
    bio: str = Field(default="", max_length=500)
    current_role: str = Field(default="", max_length=100)
    experience_years: str = Field(default="", max_length=10)
    linkedin_url: str = Field(default="", max_length=500)
    github_url: str = Field(default="", max_length=500)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class JobMatchRequest(BaseModel):
    target_role: str
    skills: list[str] = []
    missing_skills: list[str] = []


class InterviewRequest(BaseModel):
    target_role: str
    skills: list[str] = []
    missing_skills: list[str] = []


class RewriteRequest(BaseModel):
    target_role: Optional[str] = None
    resume_data: dict


class CandidateRankRequest(BaseModel):
    target_role: str
    candidates: list[dict]


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class ApplicationInput(BaseModel):
    company: str
    role: str
    status: str = "applied"
    follow_up_date: Optional[str] = None
    notes: str = ""


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None


class JDCompareRequest(BaseModel):
    resume_skills: list[str]
    job_description: str


class CoverLetterRequest(BaseModel):
    profile: dict
    job_description: str
    company: str
    role: str


class ProjectRecommendationRequest(BaseModel):
    target_role: str
    missing_skills: list[str] = []


class ShareReportRequest(BaseModel):
    analysis_id: int
    expires_in_hours: int = 72
    is_public: bool = False


class PreferencesInput(BaseModel):
    target_role: str = ""
    timeline_months: int = 6
    preferred_location: str = ""
    salary_target: int = 0
    locale: str = "en"


class BillingSubscribeRequest(BaseModel):
    plan: str


class NotificationInput(BaseModel):
    channel: str = "email"
    message: str
    send_at: int = 0


class TranslationRequest(BaseModel):
    locale: str = "en"


@app.middleware("http")
async def request_logging_and_rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now_minute = int(time.time() // 60)
    stale_keys = []
    for key in RATE_BUCKET.keys():
        minute = int(key.rsplit(":", 1)[-1])
        if minute < now_minute - 1:
            stale_keys.append(key)
    for key in stale_keys:
        RATE_BUCKET.pop(key, None)

    bucket_key = f"{client_ip}:{now_minute}"
    RATE_BUCKET[bucket_key] = RATE_BUCKET.get(bucket_key, 0) + 1
    if RATE_BUCKET[bucket_key] > RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

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
        conn.close()
    except Exception:
        pass
    return response

@app.post("/api/auth/register")
def register_user(user: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if username exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, full_name, hashed_password, role) VALUES (?, ?, ?, ?, 'user')",
            (user.username, user.email, user.full_name, hashed_password)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail="Database Error")
    
    conn.close()
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = None):
    username = form_data.username

    attempt_key = f"login:{username}"
    now = time.time()

    if attempt_key in FAILED_LOGIN_ATTEMPTS:
        attempts, first_attempt, locked_until = FAILED_LOGIN_ATTEMPTS[attempt_key]
        if locked_until and now < locked_until:
            remaining = int(locked_until - now)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Try again in {remaining} seconds."
            )

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        attempts = FAILED_LOGIN_ATTEMPTS.get(attempt_key, [0, 0, 0])[0] + 1
        if attempts >= MAX_LOGIN_ATTEMPTS:
            FAILED_LOGIN_ATTEMPTS[attempt_key] = [attempts, now, now + (LOGIN_LOCKOUT_MINUTES * 60)]
        else:
            FAILED_LOGIN_ATTEMPTS[attempt_key] = [attempts, now, None]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_dict = dict(user)

    if attempt_key in FAILED_LOGIN_ATTEMPTS:
        del FAILED_LOGIN_ATTEMPTS[attempt_key]

    access_token_expires = timedelta(minutes=60*24*7) # 7 days
    access_token = create_access_token(
        data={"sub": user_dict["username"], "role": user_dict["role"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user_dict["username"], "role": user_dict["role"]})
    refresh_payload = decode_token(refresh_token)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO refresh_tokens(token, user_id, expires_at) VALUES (?, ?, ?)",
        (refresh_token, user_dict["id"], int(refresh_payload["exp"])),
    )
    conn.commit()
    conn.close()

    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/"
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user_dict["role"],
        "full_name": user_dict.get("full_name", user_dict["username"]),
        "username": user_dict["username"]
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}


@app.get("/api/health")
def health_check():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    conn.close()
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me")
async def get_current_user_info(request: Request):
    from api.auth import get_current_user_from_cookie
    try:
        user = await get_current_user_from_cookie(request)
        user_dict = dict(user)
        return {
            "username": user["username"],
            "role": user["role"],
            "full_name": user.get("full_name", user["username"]),
        }
    except HTTPException:
        raise HTTPException(status_code=401, detail="Not authenticated")


@app.post("/api/auth/refresh")
def refresh_access_token(payload: RefreshTokenRequest, response: Response = None):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT token, expires_at, user_id FROM refresh_tokens WHERE token = ?",
        (payload.refresh_token,),
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=401, detail="Refresh token not found")
    if int(row["expires_at"]) < int(time.time()):
        cursor.execute("DELETE FROM refresh_tokens WHERE token = ?", (payload.refresh_token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=401, detail="Refresh token expired")

    new_access_token = create_access_token(
        data={"sub": decoded.get("sub"), "role": decoded.get("role")},
        expires_delta=timedelta(minutes=60 * 24 * 7),
    )
    conn.close()

    if response:
        response.set_cookie(
            key=COOKIE_NAME,
            value=new_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
            path="/"
        )

    return {"access_token": new_access_token, "token_type": "bearer"}

MAX_FILE_SIZE = 10 * 1024 * 1024

@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(None),
    current_user: dict = Depends(get_current_optional_user)
):
    is_pdf = file.filename.lower().endswith('.pdf')
    is_docx = file.filename.lower().endswith('.docx')
    if not (is_pdf or is_docx):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
    
    # Save file temporarily to disk
    ext = ".pdf" if is_pdf else ".docx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Use our new Advanced Gemini Parsing Engine
        try:
            resume_data = parse_resume_with_gemini(tmp_path, target_role)
            logger.info(f"Gemini parse success for {tmp_path}")
        except Exception as e:
            logger.warning(f"Gemini parse failed, using fallback: {e}")
            # Fallback: extract text directly and use regex parser
            try:
                raw_text = extract_text_from_pdf(tmp_path)
            except Exception as texterr:
                logger.error(f"PDF text extraction failed: {texterr}")
                raw_text = ""
            if raw_text:
                resume_data = parse_resume_fallback(resume_text, target_role)
            else:
                resume_data = {}
        
        if not resume_data:
            logger.error(f"Both Gemini and fallback parsing failed - empty result for {tmp_path}")
            raise HTTPException(status_code=500, detail="Failed to extract data from the resume")
        
        # Explainable scoring with evidence
        resume_score, feedback_msgs, score_breakdown = compute_resume_score_breakdown(resume_data)
            
        # Advanced Field Prediction based on keyword density
        skills = resume_data.get('skills', [])
        skills_lower = [s.lower() for s in skills]
        
        predicted_field = "Unknown"
        recommended_skills = []
        recommended_courses = []
        # recommended_courses = [] # This will be populated from DB
        
        # New Match Score and Missing Skills logic
        match_score = resume_data.get('match_score', 0)
        missing_skills = resume_data.get('missing_skills', [])
        missing_skills_videos = []
        
        from api.courses import predict_field_with_ai, SKILL_RECOMMENDATIONS, RESUME_VIDEOS, INTERVIEW_VIDEOS, generate_youtube_search_links, ROADMAPS
        
        # Call out to our new ML Model to get the closest semantic field
        predicted_field = predict_field_with_ai(resume_data)
        
        
        dynamic_resume_videos = RESUME_VIDEOS.get('General', [])
        dynamic_interview_videos = INTERVIEW_VIDEOS.get('General', [])
        skill_videos = []
        
        # Extract dynamic roadmap from Gemini payload
        roadmap = resume_data.get('roadmap', [])
        if not roadmap:
            roadmap = ROADMAPS.get('General', [])
            
        trends = get_market_trends_for_role('General')
        
        # Initialize Database connection early for courses
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch courses from dynamic DB instead of static dictionary
        recommended_courses = []
        cursor.execute("SELECT course_name, course_url FROM courses WHERE field = ?", ('General',))
        for row in cursor.fetchall():
            recommended_courses.append([row['course_name'], row['course_url']])
        
        mapping_field = target_role if target_role else predicted_field

        if mapping_field != "Unknown":
            recommended_skills = SKILL_RECOMMENDATIONS.get(mapping_field, [])
            
            # Fetch field-specific courses
            cursor.execute("SELECT course_name, course_url FROM courses WHERE field = ?", (mapping_field,))
            field_courses = cursor.fetchall()
            if field_courses:
                recommended_courses = [[row['course_name'], row['course_url']] for row in field_courses]

            # Fallback to static roadmap only if dynamic extraction failed
            if not resume_data.get('roadmap', []):
                roadmap = ROADMAPS.get(mapping_field, ROADMAPS['General'])
            trends = get_market_trends_for_role(mapping_field)
            dynamic_resume_videos = RESUME_VIDEOS.get(mapping_field, RESUME_VIDEOS['General'])
            dynamic_interview_videos = INTERVIEW_VIDEOS.get(mapping_field, INTERVIEW_VIDEOS['General'])
            # Generate personalized youtube links for their recommended skills
            skill_videos = generate_youtube_search_links(recommended_skills)
            
        # Generate course links specifically for missing skills if they exist
        if missing_skills:
             missing_skills_videos = generate_youtube_search_links(missing_skills)
            
        sec_token = secrets.token_hex(10)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        missing_skills_str = ", ".join(missing_skills) if missing_skills else ""
        t_role = target_role if target_role else "Unknown"
        
        u_id = -1
        if current_user and 'id' in current_user:
            u_id = current_user['id']
            
        final_response_payload = {
            "status": "success",
            "data": resume_data,
            "target_role": target_role,
            "predicted_field": predicted_field,
            "recommended_skills": recommended_skills,
            "recommended_courses": recommended_courses,
            "match_score": match_score,
            "missing_skills": missing_skills_videos,
            "missing_skill_names": missing_skills,
            "roadmap": roadmap,
            "trends": trends,
            "job_matches": generate_job_matches(mapping_field, skills, missing_skills),
            "resume_score": resume_score,
            "score_breakdown": score_breakdown,
            "feedback": feedback_msgs,
            "videos": {
                "resume": list(set(dynamic_resume_videos)),
                "interview": list(set(dynamic_interview_videos)),
                "tutorials": skill_videos
            }
        }

        try:
            cursor.execute(
                """INSERT INTO user_data (sec_token, act_name, act_mail, act_mob, Name, Email_ID, resume_score, Timestamp, Page_no, Predicted_Field, User_level, Actual_skills, Recommended_skills, Recommended_courses, pdf_name, target_role, missing_skills, user_id, analysis_data)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    sec_token, 
                    resume_data.get('name') or 'N/A', 
                    resume_data.get('email') or 'N/A',
                    resume_data.get('mobile_number') or 'N/A',
                    resume_data.get('name') or 'N/A', 
                    resume_data.get('email') or 'N/A',
                    str(resume_score),
                    timestamp,
                    str(resume_data.get('no_of_pages', 1)),
                    predicted_field,
                    "Unknown Level",
                    ", ".join(skills) if skills else "",
                    ", ".join(recommended_skills) if recommended_skills else "",
                    "Courses mapped via API",
                    file.filename,
                    t_role,
                    missing_skills_str,
                    u_id,
                    json.dumps(final_response_payload)
                )
            )
            conn.commit()
        except Exception as db_error:
            conn.rollback()
            logger.error(f"Database error during analysis: {db_error}")
            raise HTTPException(status_code=500, detail="An error occurred processing your resume.")
        finally:
            conn.close()

        return final_response_payload
        
    finally:
        os.remove(tmp_path)

@app.post("/api/feedback")
def submit_feedback(feedback: Feedback, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute(
        "INSERT INTO user_feedback (feed_name, feed_email, feed_score, comments, Timestamp) VALUES (?, ?, ?, ?, ?)",
        (feedback.name, feedback.email, feedback.score, feedback.comments, timestamp)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Feedback saved."}

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
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_data ORDER BY ID DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"users": [dict(r) for r in rows]}

@app.get("/api/admin/feedback")
def get_admin_feedback(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_feedback ORDER BY ID DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"feedback": [dict(r) for r in rows]}

@app.delete("/api/admin/users/{user_id}")
def delete_admin_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_data WHERE ID = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"User {user_id} deleted."}

@app.delete("/api/admin/feedback/{feedback_id}")
def delete_admin_feedback(feedback_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_feedback WHERE ID = ?", (feedback_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Feedback {feedback_id} deleted."}


# --- NEW ADMIN ROUTES (User Management, Course Management, Analytics) ---

@app.get("/api/admin/registered-users")
def get_registered_users(current_admin: dict = Depends(get_current_admin)):
    """Fetch all actual registered users (not anonymous uploads)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, role FROM users ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"users": [dict(r) for r in rows]}

@app.delete("/api/admin/registered-users/{user_id}")
def delete_registered_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    """Delete (ban) a registered user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"User {user_id} deleted."}

class CourseInput(BaseModel):
    field: str
    course_name: str
    course_url: str

@app.get("/api/admin/courses")
def get_all_courses(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses ORDER BY field, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"courses": [dict(r) for r in rows]}

@app.post("/api/admin/courses")
def add_course(course: CourseInput, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO courses (field, course_name, course_url) VALUES (?, ?, ?)",
        (course.field, course.course_name, course.course_url)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Course added successfully."}

@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Course deleted."}

@app.get("/api/admin/analytics")
def get_advanced_analytics(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
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

    conn.close()
    return {
        "most_sought_role": top_role,
        "most_common_missing_skill": top_skill
    }
    
@app.get("/api/user/history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    """Fetch all past resume analyses for the logged-in user."""
    if not current_user or 'id' not in current_user:
        raise HTTPException(status_code=401, detail="Unauthorized request")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ID, Timestamp, Predicted_Field, resume_score, target_role, missing_skills, Actual_skills, Recommended_skills, analysis_data
        FROM user_data
        WHERE user_id = ?
        ORDER BY ID DESC
    ''', (current_user['id'],))
    rows = cursor.fetchall()
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
            "resume_score": float(row['resume_score']),
            "missing_skills": row['missing_skills'].split(',') if row['missing_skills'] else [],
            "actual_skills": row['Actual_skills'].split(',') if row['Actual_skills'] else [],
            "recommended_skills": row['Recommended_skills'].split(',') if row['Recommended_skills'] else [],
            "analysis_data": analysis_data
        })
        
    return {"history": history}


@app.post("/api/auth/request-password-reset")
def request_password_reset(payload: PasswordResetRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email,))
    user = cursor.fetchone()
    if user:
        token = secrets.token_urlsafe(32)
        expires_at = int(time.time()) + (60 * 30)
        cursor.execute(
            "INSERT OR REPLACE INTO password_reset_tokens(token, user_id, expires_at, used) VALUES (?, ?, ?, 0)",
            (token, user["id"], expires_at),
        )
        conn.commit()
        conn.close()
        # In production, email this token. Returning token now for local/dev workflow.
        return {"status": "success", "reset_token": token, "expires_in_seconds": 1800}
    conn.close()
    return {"status": "success", "message": "If the email exists, a reset flow has been created."}


@app.post("/api/auth/reset-password")
def reset_password(payload: PasswordResetConfirm):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT token, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?",
        (payload.token,),
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid token")
    if int(row["used"]) == 1 or int(row["expires_at"]) < int(time.time()):
        conn.close()
        raise HTTPException(status_code=400, detail="Token expired or already used")

    cursor.execute(
        "UPDATE users SET hashed_password = ? WHERE id = ?",
        (get_password_hash(payload.new_password), row["user_id"]),
    )
    cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", (payload.token,))
    conn.commit()
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


@app.post("/api/jobs/applications")
def create_application(payload: ApplicationInput, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO job_applications(user_id, company, role, status, follow_up_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (current_user["id"], payload.company, payload.role, payload.status, payload.follow_up_date, payload.notes),
    )
    app_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"status": "success", "application_id": app_id}


@app.get("/api/jobs/applications")
def list_applications(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM job_applications WHERE user_id = ? ORDER BY id DESC",
        (current_user["id"],),
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"applications": rows}


@app.patch("/api/jobs/applications/{application_id}")
def update_application(application_id: int, payload: ApplicationUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM job_applications WHERE id = ? AND user_id = ?",
        (application_id, current_user["id"]),
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")

    status_value = payload.status if payload.status is not None else row["status"]
    follow_up_value = payload.follow_up_date if payload.follow_up_date is not None else row["follow_up_date"]
    notes_value = payload.notes if payload.notes is not None else row["notes"]
    cursor.execute(
        "UPDATE job_applications SET status = ?, follow_up_date = ?, notes = ? WHERE id = ? AND user_id = ?",
        (status_value, follow_up_value, notes_value, application_id, current_user["id"]),
    )
    conn.commit()
    conn.close()
    return {"status": "success"}


@app.delete("/api/jobs/applications/{application_id}")
def delete_application(application_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM job_applications WHERE id = ? AND user_id = ?", (application_id, current_user["id"]))
    conn.commit()
    conn.close()
    return {"status": "success"}


@app.post("/api/cover-letter/generate")
def generate_cover_letter(payload: CoverLetterRequest, current_user: dict = Depends(get_current_optional_user)):
    try:
        generated = generate_cover_letter_with_gemini(payload.profile, payload.job_description, payload.company, payload.role)
    except Exception as e:
        logger.warning(f"Gemini cover letter failed, using fallback: {e}")
        generated = ""
    if not generated:
        generated = generate_cover_letter_fallback(payload.profile, payload.job_description, payload.company, payload.role)
    return {"cover_letter": generated}


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
    token = secrets.token_urlsafe(24)
    expires_at = int(time.time()) + (payload.expires_in_hours * 3600)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO shared_reports(token, user_id, analysis_id, expires_at, is_public)
        VALUES (?, ?, ?, ?, ?)
        """,
        (token, current_user["id"], payload.analysis_id, expires_at, int(payload.is_public)),
    )
    conn.commit()
    conn.close()
    return {"share_token": token, "expires_at": expires_at}


@app.get("/api/reports/share/{token}")
def get_shared_report(token: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shared_reports WHERE token = ?", (token,))
    share = cursor.fetchone()
    if not share:
        conn.close()
        raise HTTPException(status_code=404, detail="Share link not found")
    if int(share["expires_at"]) < int(time.time()):
        conn.close()
        raise HTTPException(status_code=410, detail="Share link expired")
    cursor.execute("SELECT analysis_data FROM user_data WHERE ID = ?", (share["analysis_id"],))
    row = cursor.fetchone()
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
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (current_user["id"],))
    row = cursor.fetchone()
    conn.close()
    return {"profile": dict(row) if row else {}}

@app.put("/api/user/profile")
def update_user_profile(profile: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
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
    conn.close()
    return {"message": "Profile updated successfully"}

@app.get("/api/user/preferences")
def get_preferences(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (current_user["id"],))
    row = cursor.fetchone()
    conn.close()
    return {"preferences": dict(row) if row else {}}


@app.put("/api/user/preferences")
def update_preferences(payload: PreferencesInput, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
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
    conn.close()
    return {"status": "success", "plan": payload.plan, "renews_at": renews_at}


@app.get("/api/billing/subscription")
def get_subscription(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subscriptions WHERE user_id = ?", (current_user["id"],))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"subscription": {"plan": "free", "status": "active"}}
    return {"subscription": dict(row)}


@app.post("/api/notifications")
def create_notification(payload: NotificationInput, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notifications(user_id, channel, message, status, send_at) VALUES (?, ?, ?, 'pending', ?)",
        (current_user["id"], payload.channel, payload.message, payload.send_at),
    )
    notification_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"status": "success", "notification_id": notification_id}


@app.get("/api/notifications")
def list_notifications(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", (current_user["id"],))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"notifications": rows}


@app.post("/api/notifications/{notification_id}/send")
def send_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE notifications SET status = 'sent' WHERE id = ? AND user_id = ?",
        (notification_id, current_user["id"]),
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Notification marked as sent"}


@app.post("/api/i18n/translations")
def get_i18n_translations(payload: TranslationRequest):
    return {"locale": payload.locale, "translations": get_translations(payload.locale)}


@app.get("/api/admin/quality-metrics")
def quality_metrics(current_admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
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
    conn.close()
    return {
        "total_requests": total_requests,
        "server_errors": errors,
        "avg_latency_ms": round(float(avg_latency), 2),
        "resume_uploads": uploads,
        "feedback_events": feedback_count,
        "parse_failure_rate_pct": round((errors / total_requests) * 100, 2) if total_requests else 0.0,
    }
