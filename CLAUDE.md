# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
```

Optional for live market trends:
```
MARKET_DATA_PROVIDER=theirstack
THEIRSTACK_API_KEY=your_key
RATE_LIMIT_PER_MINUTE=120
```

## Architecture

### Backend (api/)
- **main.py**: FastAPI app entry point (~1300 lines). All routes defined here. Uses raw sqlite3 via SQLAlchemy engine. Implements rate limiting, request logging, and custom exception handlers.
- **database.py**: SQLite connection pooling setup. `init_db()` creates all tables on startup. Uses SQLAlchemy's `create_engine` with `QueuePool` for connection management.
- **extractor.py**: Resume parsing via Gemini + local fallback. `extract_text_from_pdf` for PDF processing.
- **career_services.py**: Scoring and matching logic. `compute_resume_score_breakdown` returns weighted scores with evidence.
- **job_hunt_services.py**: Job matching, cover letter, and project recommendations with fallback implementations.
- **auth.py**: JWT token creation/validation (HS256, 30-day access + refresh tokens). Cookie-based auth.
- **security.py**: Password hashing using passlib with bcrypt.

### Database Schema
SQLite file: `api/cv.db`. Key tables:
- `users`: Authenticated user accounts with roles (admin/user)
- `user_data`: Resume analysis history with full analysis JSON
- `courses`: Field-specific course recommendations
- `refresh_tokens`: JWT refresh token storage
- `job_applications`: User's tracked applications
- `analysis_cache`: Hash-based caching of resume results

### Frontend (frontend/src/)
- **pages/Analyzer.jsx**: Main resume upload and analysis page
- **context/AuthContext.jsx**: JWT auth state management
- Uses React Router DOM 7.x for routing

## Key Conventions

- Resume analysis uses a two-tier approach: high-confidence local parsing (>85%) or Gemini fallback
- Results are cached by file content hash to avoid repeated Gemini calls
- Auth uses dual tokens: short-lived access token in cookies + refresh token for re-auth
- All DB operations use raw sqlite3 via `get_db_connection()` (not SQLAlchemy ORM)
- Rate limiting is implemented via IP-based bucketing middleware

## Demo Accounts
| Role | Username | Password |
|------|----------|----------|
| User | `user` | `user123` |
| Admin | `admin` | `admin123` |
