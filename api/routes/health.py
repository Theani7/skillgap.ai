from datetime import datetime
from fastapi import APIRouter
from api.database import get_db_connection

router = APIRouter(tags=["health"])


@router.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}


@router.get("/api/health")
def health_check():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
    finally:
        conn.close()
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}
