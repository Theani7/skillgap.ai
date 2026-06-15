import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from api.auth import get_current_user
from api.database import get_db_connection

logger = logging.getLogger("resume-analyzer")

router = APIRouter(prefix="/api/user", tags=["user"])


class UserProfileUpdate(BaseModel):
    full_name: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=20)
    location: str = Field(default="", max_length=200)
    bio: str = Field(default="", max_length=500)
    current_role: str = Field(default="", max_length=100)
    experience_years: str = Field(default="", max_length=10)
    linkedin_url: str = Field(default="", max_length=500)
    github_url: str = Field(default="", max_length=500)


class PreferencesInput(BaseModel):
    target_role: str = Field(default="", max_length=200)
    timeline_months: int = Field(default=6, ge=1, le=120)
    preferred_location: str = Field(default="", max_length=200)
    salary_target: int = Field(default=0, ge=0, le=10_000_000)
    locale: str = Field(default="en", max_length=10)


@router.get("/latest-analysis")
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


@router.get("/history")
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


@router.delete("/history")
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


@router.delete("/analysis/{analysis_id}")
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


@router.get("/profile")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (current_user["id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    return {"profile": dict(row) if row else {}}


@router.put("/profile")
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


@router.get("/preferences")
def get_preferences(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (current_user["id"],))
        row = cursor.fetchone()
    finally:
        conn.close()
    return {"preferences": dict(row) if row else {}}


@router.put("/preferences")
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
