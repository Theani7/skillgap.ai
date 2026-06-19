# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

SkillGap.ai is a full-stack SaaS platform that analyzes resumes using NLP and Generative AI to provide career coaching, skill gap analysis, and learning roadmaps. It uses Google Gemini for AI processing and SQLite for data persistence.

## Running the Application

### Backend
```bash
# Activate virtual environment
source venvapp/bin/activate

# Install dependencies
pip install -r api/requirements.txt

# Start server
uvicorn api.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` in root directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=at-least-32-random-characters-please
DB_FILE=api/cv.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENV=development
```

Optional:
```
MARKET_DATA_PROVIDER=theirstack
THEIRSTACK_API_KEY=your_key
RATE_LIMIT_PER_MINUTE=120
SEED_DEMO=1   # only set in dev to seed a default admin account
```

`JWT_SECRET_KEY` is **required** in production. In development, a per-process random key is used (sessions reset on restart). `SEED_DEMO=1` seeds an `admin / admin123` account on first boot; never set this in production.

## Architecture

### Backend (api/)
- **main.py**: FastAPI app entry point (~1300 lines). All routes defined here. Validates ownership on share endpoints, rotates refresh tokens, enforces strict token-type checks.
- **database.py**: SQLite setup. `init_db()` creates all tables on import and runs light migrations. Uses `pypdf` (not PyPDF2) and `defusedxml` for parsing.
- **extractor.py**: Resume parsing via Gemini + local fallback. Magic-byte detection in `main.py` (PDF/DOCX).
- **career_services.py**: Scoring and matching logic.
- **job_hunt_services.py**: Job matching, JD comparison, and project recommendations.
- **auth.py**: JWT (PyJWT) token creation/validation (HS256, 30-min access + 30-day refresh). Refresh tokens are **hashed in the DB**, rotated on every refresh, deleted on logout.
- **security.py**: Password hashing using `bcrypt` directly (no passlib — passlib is unmaintained and incompatible with bcrypt ≥4.1).

### Database Schema
SQLite file: `api/cv.db`. Key tables:
- `users`: Authenticated user accounts with roles (admin/user)
- `user_data`: Resume analysis history with full analysis JSON
- `courses`: Field-specific course recommendations
- `refresh_tokens`: SHA-256 hashes of refresh JWTs (the raw JWT is the httpOnly cookie)
- `analysis_cache`: (content_hash, target_role) composite PK with `expires_at` TTL (7 days)
- `login_attempts`, `password_reset_tokens`, `user_profiles`, `user_preferences`, `shared_reports`, `notifications`, `subscriptions`, `request_logs`, `rate_limits`

### Frontend (frontend/src/)
- **pages/Analyzer.jsx**: Main resume upload and analysis page
- **pages/Admin.jsx**: Admin control panel (Dashboard, Resume Logs, Users, Feedback, Courses)
- **context/AuthContext.jsx**: Auth state; reads `/api/auth/me` on mount, httpOnly cookies carry the JWT
- **components/Sidebar.jsx**: Authenticated app shell (Analyze / Track / Manage groups)
- **components/ErrorBoundary.jsx**: Wraps every route; shows recovery UI on render errors
- All routes are lazy-loaded (`React.lazy`) for code splitting
- Uses React Router DOM 7.x for routing

## Development Workflow

- After every change, commit and push to GitHub immediately.
- Use clear, concise commit messages describing what changed.
- Follow title case for UI text (e.g., "Log in", "Sign up").

## Key Conventions

- Resume analysis uses a two-tier approach: high-confidence local parsing (>85%) or Gemini fallback
- Results are cached by `(content_hash, target_role)` to avoid repeated Gemini calls; cache expires after 7 days
- Auth: httpOnly cookies carry the access (30 min) and refresh (30 d) JWTs. Refresh tokens are SHA-256-hashed in the DB, rotated on every refresh, and deleted on logout / password change. No tokens are stored in `localStorage`.
- All DB operations use `sqlite3.Row` via `get_db_connection()` (SQLAlchemy engine with WAL mode + `foreign_keys=ON`)
- Rate limiting is implemented via IP-based bucketing middleware
- File uploads are validated by magic bytes (`%PDF`, `PK\x03\x04`), not just extension
- All input fields are Pydantic-validated with `max_length` and pattern constraints

## Demo Accounts

The app does **not** auto-seed an admin account. To create demo credentials, set `SEED_DEMO=1` in `.env` before the first request — this creates `admin / admin123`. Do not enable this in production. To create your own admin, register a user and run:

```sql
UPDATE users SET role = 'admin' WHERE username = 'yourname';
```

from the project root.
