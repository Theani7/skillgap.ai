# SkillPath

> AI-powered resume analysis, career coaching, and skill gap identification platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)

---

## Overview

SkillPath is a full-stack SaaS platform that transforms static resume reviews into data-driven career coaching. It parses PDF/DOCX resumes, evaluates skills against real-time industry demands, and generates personalized learning roadmaps using NLP and Generative AI.

### Who It's For

| Audience | Use Case |
|----------|----------|
| **Job Seekers** | Improve resume, identify skill gaps, prepare for interviews |
| **Career Changers** | Plan transition path into tech roles |
| **Recruiters** | Evaluate candidate fit against job requirements |
| **Hiring Managers** | Understand market trends and skill demands |

---

## Features

### Resume Analysis
- Multi-format parsing (PDF, DOCX) with magic-byte validation
- 22 predefined target roles (Data Science, Web Development, DevOps, Cloud Engineering, AI/ML, Cybersecurity, Mobile Development, and 15 more)
- Skills classified as **required** (6 per role) and **nice-to-have** (9 per role)
- Resume score breakdown across 5 dimensions with weighted scoring
- Required skills weighted 2.4x in match score calculation

### AI-Powered Career Coaching
- 4-phase learning roadmap generation (via Google Gemini or local fallback)
- Interactive roadmap progress tracking with skill-level checkpoints
- Actionable learning recommendations per skill gap
- Course suggestions from Coursera and Udemy with platform-branded thumbnails

### Career Toolkit
- **Mock Interview** — Practice mode (static questions) + AI mode (dynamic, LLM-generated)
- **Job Matches** — Market-aligned job suggestions with role fit scores
- **Resume Rewrite** — Rewrites experience bullets with stronger action/outcome framing
- **JD Comparator** — Keyword coverage analysis against job descriptions
- **Project Optimizer** — Portfolio project recommendations based on skill gaps
- **Team Ranking** — Rank multiple candidates with unified scoring

### User Dashboard
- Historical analysis tracking with score progression charts
- Skill trends visualization (learned vs. missing over time)
- Roadmap progress persistence across sessions
- Account settings with password change and self-deletion

### Market Intelligence
- Skill demand trends by role (area, bar, and pie charts)
- Salary ranges and job posting trends
- Workplace distribution (remote/hybrid/onsite)
- Regional market comparisons

### Admin Panel
- **Dashboard** — Total users, resumes analyzed, average scores, upload trends
- **User Management** — Search, role toggle, activate/deactivate accounts
- **Resume Logs** — Paginated resume detail view with delete
- **Feedback** — Sentiment analysis (positive/negative/neutral ratio), color-coded ratings, distribution chart
- **Courses** — CRUD for course recommendations per role
- **Job Roles** — Read-only predefined roles with inline course management
- **Market Data** — Role-specific skill demand, salary trends, workforce distribution
- **AI Monitoring** — Analysis cache management, API usage tracking
- **Audit Logs** — Full activity audit trail
- **Data Export** — CSV export for any table
- **Taxonomy** — Skills, roadmaps, role configs, video resources management

---

## Tech Stack

### Frontend

Managed with **Bun** (install, dev server, build, lint).

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool and dev server |
| React Router DOM | 7.x | Client-side routing |
| Recharts | — | Data visualization (area, bar, pie, radar charts) |
| Framer Motion | — | Animations and transitions |
| Lucide React | — | Icon library |
| Axios | — | HTTP client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Runtime |
| FastAPI | 0.115+ | Web framework |
| Uvicorn | — | ASGI server |
| SQLite | — | Database (WAL mode, 40+ tables) |
| SQLAlchemy | 2.0+ | Database engine |
| PyJWT | 2.10+ | JWT token management |
| bcrypt | 4.2+ | Password hashing |
| Google Generative AI | 0.8+ | Gemini API (optional) |
| llama-cpp-python | 0.3+ | Local LLM runtime |
| PyMuPDF | 1.24+ | PDF parsing |
| python-docx | 1.1+ | DOCX parsing |
| defusedxml | 0.7+ | Safe XML parsing |

### AI Models

| Model | Size | Usage |
|-------|------|-------|
| **Google Gemini 2.0 Flash** | Cloud | Primary analysis, roadmap generation, interview questions |
| **Qwen2-0.5B-Instruct** (Q4_K_M) | 379MB | Offline fallback for resume parsing (tracked via Git LFS) |

---

## Project Structure

```
skillpath.ai/
├── api/                            # Backend (FastAPI)
│   ├── main.py                     # App entry, routes, middleware, CORS
│   ├── database.py                 # Schema, migrations, seeding, caching
│   ├── auth.py                     # JWT creation/validation, auth dependencies
│   ├── security.py                 # Password hashing (bcrypt)
│   ├── extractor.py                # Resume text extraction (PDF/DOCX/Gemini)
│   ├── local_llm.py                # Local Qwen2 model integration
│   ├── career_services.py          # Resume scoring, skill analysis
│   ├── job_hunt_services.py        # Job matching, JD comparison
│   ├── courses.py                  # Course data, skill recommendations
│   ├── market_data.py              # Market trend data + cache
│   ├── mock_interview.py           # Static interview questions
│   ├── mock_interview_ai.py        # AI-generated interview sessions
│   ├── course_scraper.py           # Coursera scraping, Udemy fallback
│   ├── scraper.py                  # Market data simulation
│   ├── requirements.txt            # Python dependencies
│   ├── routes/
│   │   ├── admin.py                # Admin CRUD, audit, export, scrape
│   │   ├── auth.py                 # Register, login, logout, refresh, password
│   │   ├── user.py                 # Profile, preferences, history, analysis
│   │   ├── analysis.py             # Resume analysis pipeline
│   │   └── jobs.py                 # Job matches, interview, JD compare
│   ├── data/
│   │   └── mock_questions.json     # Static interview questions
│   └── llm/
│       └── qwen2-0_5b-instruct-q4_k_m.gguf  # Local model (379MB)
│
├── frontend/                       # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                 # Routes (lazy-loaded)
│   │   ├── main.jsx                # Entry point
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public landing page
│   │   │   ├── Analyzer.jsx        # Resume upload + analysis
│   │   │   ├── AnalysisResult.jsx  # Results (7 tabs)
│   │   │   ├── MockInterview.jsx   # Mock interview (Practice + AI)
│   │   │   ├── Admin.jsx           # Admin dashboard
│   │   │   ├── Settings.jsx        # User settings
│   │   │   ├── Profile.jsx         # User profile + skill trends
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   ├── JobRoles.jsx        # Admin job role management
│   │   │   ├── AIMonitoring.jsx    # Admin AI monitoring
│   │   │   └── SharedReport.jsx    # Shared report viewer
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Public navigation bar
│   │   │   ├── Sidebar.jsx         # App sidebar (collapsible)
│   │   │   ├── AuthModal.jsx       # Login/register modal
│   │   │   ├── ErrorBoundary.jsx   # Error recovery UI
│   │   │   ├── ProtectedRoute.jsx  # Auth guard (roles + exclusions)
│   │   │   ├── Roadmap.jsx         # Interactive roadmap
│   │   │   ├── TrendDashboard.jsx  # Market trend charts
│   │   │   └── Skeleton.jsx        # Loading skeletons
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + interceptors
│   │   └── styles/
│   │       ├── theme.css           # Design tokens + global styles
│   │       └── animations.css      # Keyframe animations
│   └── package.json
│
├── setup.sh                        # Cross-platform setup script
├── run.js                          # Cross-platform helper to run venv Python commands
├── bun.lock                        # Bun lockfile (committed, used with --frozen-lockfile)
├── package.json                    # Root scripts (setup, dev, build) — run with Bun
├── .env.example                    # Environment variable template
└── venvapp/                        # Python virtual environment
```

---

## Getting Started

### Prerequisites

- **Bun** v1.3+ ([install](https://bun.sh)) — used for all frontend install/dev/build/lint
- **Python** v3.9+ — `bun run setup` auto-creates a venv at `venvapp/` (Windows needs the `py` launcher from the official Python installer)
- **Git LFS** — the local LLM model is tracked via Git LFS; run `git lfs install` after cloning
- **Google Gemini API key** (optional — app works without it using local Qwen2-0.5B model)

### Quick Start

```bash
# Clone the repository (Git LFS fetches the local model automatically)
git clone https://github.com/Theani7/skillpath.ai.git
cd skillpath.ai
git lfs install

# One-time setup (creates venv, installs Python + frontend dependencies, creates .env)
bun run setup

# Start both backend and frontend
bun run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Bun Scripts

| Command | Description |
|---------|-------------|
| `bun run setup` | One-time setup: creates venv, installs Python + frontend dependencies |
| `bun run dev` | Starts backend + frontend in parallel |
| `bun run dev:backend` | Starts only the backend server |
| `bun run dev:frontend` | Starts only the frontend dev server |
| `bun run build` | Production build of the frontend |
| `bun run lint` | Run ESLint on frontend code |

### Environment Variables

Create a `.env` file in the project root (or copy `.env.example`):

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Security (required in production)
JWT_SECRET_KEY=at-least-32-random-characters-please

# Database
DB_FILE=api/cv.db

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Environment
ENV=development

# Admin account (auto-created on first boot if both set)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Optional:
```env
MARKET_DATA_PROVIDER=theirstack
THEIRSTACK_API_KEY=your_key
RATE_LIMIT_PER_MINUTE=120
```

### Manual Setup

<details>
<summary>Manual setup instructions</summary>

#### Backend

```bash
python3 -m venv venvapp
source venvapp/bin/activate          # macOS/Linux
# venvapp\Scripts\activate           # Windows
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
bun install
bun run dev
```

</details>

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:

- **Frontend** — installs with `bun install --frozen-lockfile`, then `bun run lint` and `bun run build`.
- **Backend** — `python -m pytest api/tests` against Python 3.11.

The 379MB local LLM model is fetched via Git LFS during checkout, so CI clones stay fast.

---

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate (returns httpOnly cookies) | No |
| POST | `/api/auth/logout` | Invalidate refresh token | Yes |
| POST | `/api/auth/refresh` | Rotate refresh token | Cookie |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/me` | Get current user profile | Cookie |
| GET | `/api/auth/check-username/{username}` | Check username availability | No |

### Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/analyze` | Upload and analyze resume | Yes |
| GET | `/api/user/latest-analysis` | Get most recent analysis | Yes |
| GET | `/api/user/history` | Get analysis history | Yes |
| DELETE | `/api/user/analysis/{id}` | Delete specific analysis | Yes |

### Career Toolkit

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/jobs/matches` | Get job match suggestions | Optional |
| POST | `/api/interview/copilot` | Generate interview questions | Optional |
| POST | `/api/rewrite-resume` | Rewrite experience bullets | Optional |
| POST | `/api/jd/compare` | Compare resume against JD | Optional |
| POST | `/api/projects/recommend` | Get project recommendations | Optional |
| POST | `/api/team/rank-candidates` | Rank multiple candidates | Optional |

### Mock Interview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/mock-interview` | List available roles | No |
| GET | `/api/mock-interview/{role}` | Get questions for role | No |
| POST | `/api/mock-interview/start` | Start AI interview session | Yes |
| POST | `/api/mock-interview/answer` | Submit answer, get feedback | Yes |
| POST | `/api/mock-interview/finish/{id}` | End session, get evaluation | Yes |

### User

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| GET | `/api/user/preferences` | Get preferences | Yes |
| PUT | `/api/user/preferences` | Update preferences | Yes |
| GET | `/api/user/skill-trends` | Get skill trend data | Yes |
| GET | `/api/user/roadmap-progress` | Get roadmap progress | Yes |
| PUT | `/api/user/roadmap-progress` | Update roadmap progress | Yes |
| POST | `/api/user/contact-support` | Send support message | Yes |
| DELETE | `/api/user/account` | Delete account + all data | Yes |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users (paginated) | Admin |
| GET | `/api/admin/feedback` | List feedback (paginated) | Admin |
| GET | `/api/admin/feedback/stats` | Feedback sentiment stats | Admin |
| GET | `/api/admin/courses` | List all courses | Admin |
| POST | `/api/admin/courses` | Add course | Admin |
| PATCH | `/api/admin/courses/{id}` | Update course | Admin |
| DELETE | `/api/admin/courses/{id}` | Delete course | Admin |
| GET | `/api/admin/job-roles` | List job roles | Admin |
| PATCH | `/api/admin/job-roles/{id}/status` | Toggle role active/inactive | Admin |
| GET | `/api/admin/analytics` | Platform analytics | Admin |
| GET | `/api/admin/analytics/uploads-over-time` | Upload trend data | Admin |
| GET | `/api/admin/analytics/skill-gaps` | Skill gap distribution | Admin |
| GET | `/api/admin/analytics/role-distribution` | Role distribution data | Admin |
| GET | `/api/admin/quality-metrics` | Analysis quality metrics | Admin |
| GET | `/api/admin/audit-logs` | Activity audit trail | Admin |
| GET | `/api/admin/analysis-cache` | Cached analyses | Admin |
| GET | `/api/admin/export/{table}` | Export table as CSV | Admin |

### Public

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |
| GET | `/api/job-roles` | List active job roles | No |
| POST | `/api/feedback` | Submit feedback | Yes |

---

## Database

SQLite database (`api/cv.db`) with 40+ tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles (admin/user) |
| `user_data` | Resume analysis history + full analysis JSON |
| `refresh_tokens` | SHA-256 hashed refresh JWTs |
| `job_roles` | 22 predefined career roles |
| `job_role_skills` | 330 skills (6 required + 9 nice-to-have per role) |
| `career_roadmaps` | 22 role-specific career roadmaps |
| `roadmap_steps` | 88 roadmap steps with resources |
| `courses` | 66 course recommendations (Coursera/Udemy) |
| `skill_recommendations` | 167 skill-specific learning recommendations |
| `learning_resources` | 54 curated learning resources |
| `learning_actions` | 81 actionable learning steps |
| `video_resources` | 186 video tutorials by skill |
| `skill_difficulty` | Difficulty ratings for 94 skills |
| `analysis_cache` | Cached analysis results (7-day TTL) |
| `audit_logs` | Admin activity audit trail |
| `request_logs` | API request logging |

### Seeding

On first boot, the database is automatically seeded with:
- 22 job roles with 15 skills each (6 required + 9 nice-to-have)
- 22 career roadmaps with 4 steps each
- 66 courses from Coursera/Udemy
- Skill recommendations, learning resources, video tutorials, and difficulty ratings

---

## Security

| Feature | Implementation |
|---------|---------------|
| **Authentication** | httpOnly cookies (`skillpath_access`, `skillpath_refresh`) with `SameSite=Strict` |
| **JWT** | HS256, 30-min access + 30-day refresh tokens |
| **Token Rotation** | Refresh tokens are SHA-256 hashed in DB, rotated on every refresh |
| **Password Hashing** | bcrypt (direct usage, no passlib) |
| **Account Deactivation** | `is_active` flag enforced at login + all auth dependencies |
| **File Validation** | Magic-byte checking (`%PDF`, `PK\x03\x04`), not just extension |
| **Input Validation** | Pydantic models with `max_length` and pattern constraints |
| **Rate Limiting** | IP-based bucketing middleware |
| **CORS** | Restricted to configured origins |
| **Admin Protection** | Role-based route exclusion (`excludedRoles` prop) |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite over PostgreSQL | Zero-config, single-file deployment for MVP |
| httpOnly cookies over localStorage JWT | Prevents XSS token theft |
| SHA-256 hashed refresh tokens | Database stores hashes, not raw tokens |
| Two-tier parsing (Gemini + local fallback) | Works offline, Gemini for quality |
| Magic-byte file validation | Prevents malicious file uploads via renamed extensions |
| In-memory cache for market data | Avoids repeated Gemini/DB calls |
| Required vs nice-to-have skill weighting | Required skills weighted 2.4x in match score |
| `run.js` cross-platform helper | Resolves the venv Python binary across macOS/Windows/Linux so `bun run dev:backend` works everywhere |
| Bun for frontend tooling | `bun install` / `bun run dev` / `bun run build` replace npm for speed and a single lockfile |
| Git LFS for the local LLM | The 379MB Qwen2 model is stored in Git LFS so it clones on demand without bloating git history |

---

## Development

### Code Conventions

- Group related changes into logical commits
- Push when feature/fix is complete, not after every small change
- Follow title case for UI text (e.g., "Log in", "Sign up")
- Use design tokens from `tokens.css` and `theme.css`
- No comments unless asked

### Key Patterns

- **Backend routing**: Split across `api/routes/` modules, included in `main.py`
- **Frontend routes**: Lazy-loaded in `App.jsx` via `React.lazy`
- **State management**: React Context (`AuthContext`) + local component state
- **API calls**: Centralized Axios instance with 401 interceptor
- **Database**: `sqlite3.Row` via `get_db_connection()`, WAL mode + foreign keys
- **Caching**: In-memory dict caches loaded from DB on startup

---

## License

MIT License — see [LICENSE](LICENSE) for details.
