from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import uuid
import logging

from api.database import get_db_connection
from api.exceptions import SkillGapException
from api.mock_interview import router as mock_interview_router
from api.mock_interview_ai import router as mock_interview_ai_router
from api.routes.auth import router as auth_router
from api.routes.analysis import router as analysis_router
from api.routes.admin import router as admin_router
from api.routes.health import router as health_router
from api.routes.user import router as user_router
from api.routes.sharing import router as sharing_router
from api.routes.jobs import router as jobs_router
from api.routes.misc import router as misc_router
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
app.include_router(mock_interview_ai_router)
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(admin_router)
app.include_router(health_router)
app.include_router(user_router)
app.include_router(sharing_router)
app.include_router(jobs_router)
app.include_router(misc_router)

logger = logging.getLogger("resume-analyzer")
logging.basicConfig(level=logging.INFO)

_validate_env()

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
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
    allow_headers=["Authorization", "Content-Type", "Cookie", "X-Requested-With"],
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




def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@app.middleware("http")
async def request_logging_and_rate_limit(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

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






