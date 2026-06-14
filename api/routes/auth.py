import json
import logging
import os
import time
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field

from api.auth import (
    COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user_from_cookie,
    hash_token,
)
from api.database import get_db_connection
from api.security import get_password_hash, verify_password

logger = logging.getLogger("resume-analyzer")

router = APIRouter(prefix="/api/auth", tags=["auth"])

MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 15
AUTH_RATE_LIMIT_PER_MINUTE = 20

ENV = os.getenv("ENV", "development").lower()
IS_PROD = ENV in ("production", "prod")


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[A-Za-z0-9_.-]+$')
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _check_strict_rate_limit(key: str, limit: int = AUTH_RATE_LIMIT_PER_MINUTE):
    """Per-endpoint rate limit (stricter than global). Raises 429 if exceeded."""
    now_minute = int(time.time() // 60)
    bucket = f"{key}:{now_minute}"
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO rate_limits (key, count, updated_at) VALUES (?, 1, ?) "
            "ON CONFLICT(key) DO UPDATE SET count = count + 1, updated_at = ?",
            (bucket, now_minute, now_minute),
        )
        cursor.execute("SELECT count FROM rate_limits WHERE key = ?", (bucket,))
        row = cursor.fetchone()
        count = row["count"] if row else 1
        conn.commit()
        if count > limit:
            raise HTTPException(status_code=429, detail="Too many requests. Try again in a minute.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth rate limit error: {e}")
        conn.rollback()
    finally:
        conn.close()


async def _extract_refresh_from_request(request: Request) -> Optional[str]:
    try:
        body = await request.body()
        if body:
            data = json.loads(body)
            return data.get("refresh_token")
    except Exception:
        pass
    return None


@router.get("/check-username/{username}")
def check_username(username: str, request: Request):
    _check_strict_rate_limit(f"username-check:{_client_ip(request)}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        exists = cursor.fetchone() is not None
    finally:
        conn.close()
    return {"available": not exists}


@router.post("/register")
def register_user(user: UserRegister, request: Request):
    _check_strict_rate_limit(f"register:{_client_ip(request)}")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if username exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already registered")

        # Check if email exists
        cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        cursor.execute(
            "INSERT INTO users (username, email, full_name, hashed_password, role) VALUES (?, ?, ?, ?, 'user')",
            (user.username, user.email, user.full_name, hashed_password)
        )
        conn.commit()
        return {"message": "User registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration DB error for {user.username}: {e}")
        raise HTTPException(status_code=500, detail="Database Error")
    finally:
        conn.close()


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = None, request: Request = None):
    _check_strict_rate_limit(f"login:{_client_ip(request) if request else 'unknown'}")
    username = form_data.username
    now = int(time.time())

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check for existing lockout
        cursor.execute("SELECT * FROM login_attempts WHERE username = ?", (username,))
        attempt_row = cursor.fetchone()

        if attempt_row:
            if attempt_row["locked_until"] and now < attempt_row["locked_until"]:
                remaining = int(attempt_row["locked_until"] - now)
                conn.close()
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many failed attempts. Try again in {remaining} seconds."
                )

        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if not user or not verify_password(form_data.password, user["hashed_password"]):
            # Increment failed attempts
            if attempt_row:
                attempts = attempt_row["attempts"] + 1
                locked_until = now + (LOGIN_LOCKOUT_MINUTES * 60) if attempts >= MAX_LOGIN_ATTEMPTS else 0
                cursor.execute(
                    "UPDATE login_attempts SET attempts = ?, locked_until = ? WHERE username = ?",
                    (attempts, locked_until, username)
                )
            else:
                cursor.execute(
                    "INSERT INTO login_attempts (username, attempts, first_attempt, locked_until) VALUES (?, ?, ?, ?)",
                    (username, 1, now, 0)
                )
            conn.commit()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_dict = dict(user)

        cursor.execute("DELETE FROM login_attempts WHERE username = ?", (username,))
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id = ?", (user_dict["id"],))
        conn.commit()

        access_token = create_access_token(
            data={"sub": user_dict["username"]}, expires_delta=timedelta(minutes=30)
        )
        refresh_token = create_refresh_token(data={"sub": user_dict["username"]})
        refresh_payload = decode_token(refresh_token)
        token_hash = hash_token(refresh_token)
        cursor.execute(
            "INSERT INTO refresh_tokens(token, user_id, expires_at) VALUES (?, ?, ?)",
            (token_hash, user_dict["id"], int(refresh_payload["exp"])),
        )
        conn.commit()
    finally:
        conn.close()

    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=IS_PROD,
        samesite="strict",
        max_age=60 * 30,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=IS_PROD,
        samesite="strict",
        max_age=60 * 60 * 24 * 30,
        path="/api/auth",
    )

    return {
        "role": user_dict["role"],
        "full_name": user_dict.get("full_name", user_dict["username"]),
        "username": user_dict["username"]
    }


@router.post("/logout")
async def logout(request: Request, response: Response):
    refresh = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh:
        refresh = await _extract_refresh_from_request(request)
    if refresh:
        try:
            decoded = decode_token(refresh)
            username = decoded.get("sub")
        except Exception:
            username = None
        if username:
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM refresh_tokens WHERE token = ? AND user_id = (SELECT id FROM users WHERE username = ?)",
                               (hash_token(refresh), username))
                conn.commit()
            except Exception as logout_err:
                logger.error(f"Logout DB error for {username}: {logout_err}")
            finally:
                conn.close()
    response.delete_cookie(key=COOKIE_NAME, path="/")
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/auth")
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(request: Request):
    try:
        user = await get_current_user_from_cookie(request)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "username": user["username"],
        "role": user["role"],
        "full_name": user.get("full_name", user["username"]),
        "email": user.get("email"),
    }


@router.post("/refresh")
def refresh_access_token(request: Request, payload: RefreshTokenRequest, response: Response = None):
    refresh_token = payload.refresh_token or request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        decoded = decode_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_hash = hash_token(refresh_token)
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?",
            (token_hash,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Refresh token not recognized")
        if int(row["expires_at"]) < int(time.time()):
            cursor.execute("DELETE FROM refresh_tokens WHERE token = ?", (token_hash,))
            conn.commit()
            raise HTTPException(status_code=401, detail="Refresh token expired")

        new_access_token = create_access_token(
            data={"sub": decoded.get("sub")},
            expires_delta=timedelta(minutes=30),
        )
        new_refresh_token = create_refresh_token(data={"sub": decoded.get("sub")})
        new_payload = decode_token(new_refresh_token)
        cursor.execute("DELETE FROM refresh_tokens WHERE token = ?", (token_hash,))
        cursor.execute(
            "INSERT INTO refresh_tokens(token, user_id, expires_at) VALUES (?, ?, ?)",
            (hash_token(new_refresh_token), row["user_id"], int(new_payload["exp"])),
        )
        conn.commit()
        # Look up the user's role for the response
        cursor.execute("SELECT role FROM users WHERE id = ?", (row["user_id"],))
        user_row = cursor.fetchone()
        user_role = user_row["role"] if user_row else "user"
    finally:
        conn.close()

    if response:
        response.set_cookie(
            key=COOKIE_NAME,
            value=new_access_token,
            httponly=True,
            secure=IS_PROD,
            samesite="strict",
            max_age=60 * 30,
            path="/",
        )
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=new_refresh_token,
            httponly=True,
            secure=IS_PROD,
            samesite="strict",
            max_age=60 * 60 * 24 * 30,
            path="/api/auth",
        )

    return {"token_type": "bearer", "role": user_role}
