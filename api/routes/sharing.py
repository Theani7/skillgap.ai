import json
import logging
import secrets
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from api.auth import get_current_user
from api.database import get_db_connection

logger = logging.getLogger("resume-analyzer")

router = APIRouter(prefix="/api/reports", tags=["sharing"])


class ShareReportRequest(BaseModel):
    analysis_id: int = Field(..., gt=0)
    expires_in_hours: int = Field(default=72, ge=1, le=8760)
    is_public: bool = False


@router.post("/share")
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


@router.get("/share/{token}")
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
