# SkillGap.ai - System Architecture

## Overview

SkillGap.ai is an AI-driven career catalyst application that analyzes resumes, identifies skill gaps, and provides personalized course recommendations. The system follows a modern client-server architecture with a React frontend and Python FastAPI backend.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SKILLGAP.AI ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐      HTTP/REST      ┌─────────────────┐               │
│  │   REACT FRONTEND │◄─────────────────►│  FASTAPI BACKEND│               │
│  │    (Port 5173)  │    Bearer Token    │   (Port 8000)   │               │
│  └─────────────────┘                     └────────┬────────┘               │
│         │                                         │                         │
│         │                                         │                         │
│    ┌────┴────┐                              ┌────┴────┐                   │
│    │  LocalStorage                          │  SQLite │                   │
│    │  (Token)                               │  (cv.db)│                   │
│    └─────────┘                              └─────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 6.x | Build Tool & Dev Server |
| React Router DOM | 7.x | Client-side Routing |
| Framer Motion | 12.x | Animations |
| Axios | 1.x | HTTP Client |
| Recharts | 2.x | Data Visualization |
| Lucide React | 0.x | Icon Library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.13+ | Runtime |
| FastAPI | 0.115.x | Web Framework |
| Uvicorn | 0.x | ASGI Server |
| SQLAlchemy | 2.x | ORM |
| PyPDF2 | 3.x | PDF Parsing |
| python-docx | 1.x | DOCX Parsing |
| spaCy | 3.x | NLP Processing |
| python-multipart | 0.x | File Uploads |
| python-jose | 3.x | JWT Handling |
| passlib | 1.x | Password Hashing |

### Database
- **SQLite** (`cv.db`) - Single-file relational database
- Tables: `users`, `upload_history`, `user_preferences`

---

## Frontend Architecture

### Project Structure
```
frontend/
├── index.html              # Vite entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── public/                # Static assets
└── src/
    ├── main.jsx           # App entry point
    ├── App.jsx            # Root component with routing
    ├── index.css          # Claymorphism design system (950+ lines)
    ├── context/
    │   └── AuthContext.jsx # Global auth state management
    ├── components/
    │   ├── Navbar.jsx     # Navigation with Claymorphism
    │   ├── Footer.jsx     # Footer component
    │   ├── FloatingBlobs.jsx # Animated background
    │   ├── ProtectedRoute.jsx # Auth guard
    │   └── ResultsDisplay.jsx # Analysis results
    └── pages/
        ├── Landing.jsx    # Marketing page
        ├── Login.jsx      # Authentication
        ├── Register.jsx   # User registration
        ├── Analyzer.jsx   # Resume upload & analysis
        ├── Profile.jsx    # User dashboard
        └── Admin.jsx      # Admin panel
```

### Component Hierarchy
```
App (BrowserRouter)
├── AuthProvider
│   └── Routes
│       ├── / (Landing)
│       ├── /login (Login)
│       ├── /register (Register)
│       ├── /app (ProtectedRoute -> Analyzer)
│       ├── /profile (ProtectedRoute -> Profile)
│       └── /admin (ProtectedRoute -> Admin)
├── FloatingBlobs (Background)
├── Navbar
└── Footer
```

### State Management
- **AuthContext**: Manages authentication state (`user`, `token`, `role`)
- **Local State**: Each page manages its own form/input state
- **No Redux/Zustand**: Simple context-based state for this scale

### Design System: Claymorphism
| Element | CSS Class | Properties |
|---------|-----------|------------|
| Cards | `.clay-card` | `border-radius: 20-60px`, 4-layer shadow |
| Buttons | `.clay-btn` | Gradient backgrounds, press effects |
| Inputs | `.clay-input` | Inset shadows, 12-16px radius |
| Icons | `.clay-icon` | 48px circular gradient containers |
| Badges | `.clay-badge` | Pill-shaped accent colors |

---

## Backend Architecture

### Project Structure
```
api/
├── main.py                 # FastAPI app entry point
├── config.py              # Environment configuration
├── database.py            # SQLAlchemy setup
├── models.py              # Database models (User, History)
├── schemas.py             # Pydantic request/response models
├── auth.py                # JWT & password utilities
├── resume_analyzer.py     # NLP & analysis engine
├── courses.py             # Course recommendation mappings
└── routers/
    ├── auth.py            # /api/auth/* endpoints
    └── analysis.py        # /api/analyze endpoint
```

### Database Models (SQLAlchemy)

```python
class User:
    id: Integer (PK)
    username: String (unique)
    email: String (unique)
    full_name: String
    hashed_password: String
    role: String (user/admin)
    created_at: DateTime
    
class UploadHistory:
    id: Integer (PK)
    user_id: Integer (FK)
    timestamp: DateTime
    resume_score: Float
    target_role: String
    predicted_field: String
    missing_skills: JSON
    recommended_courses: JSON
    analysis_data: JSON
```

### Authentication Flow
```
1. User submits credentials
2. FastAPI validates against SQLite
3. JWT token generated (30-day expiry)
4. Token returned to frontend
5. Frontend stores in localStorage
6. Subsequent requests include: Authorization: Bearer <token>
7. Protected routes validate JWT via dependency
```

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user | No |
| POST | `/login` | Authenticate & get token | No |

### Analysis (`/api`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze` | Upload & analyze resume | Yes |

### User Data (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/history` | Get upload history | Yes |
| GET | `/preferences` | Get user preferences | Yes |
| PUT | `/preferences` | Update preferences | Yes |
| GET | `/profile` | Get profile data | Yes |
| PUT | `/profile` | Update profile | Yes |

---

## Data Flow: Resume Analysis

```
1. User uploads PDF/DOCX
        │
        ▼
2. Frontend sends to /api/analyze
   (multipart/form-data)
        │
        ▼
3. FastAPI receives file
        │
        ├─► pdfminer/PyPDF2 extracts text
        │
        ▼
4. spaCy NLP processing
        │
        ├─► Extract skills, experience
        ├─► Match against target role skills
        │
        ▼
5. Resume Analyzer Logic
        │
        ├─► Calculate match score
        ├─► Identify missing skills
        ├─► Recommend courses (courses.py)
        │
        ▼
6. Store in SQLite (upload_history)
        │
        ▼
7. Return JSON to frontend
        │
        ▼
8. ResultsDisplay component renders
   (charts, skill gaps, course links)
```

---

## Security Architecture

### Authentication
- **JWT Tokens**: HS256 algorithm, 30-day expiration
- **Password Hashing**: bcrypt via passlib
- **Protected Routes**: FastAPI dependency (`get_current_user`)

### Input Validation
- **Pydantic Models**: Request validation
- **File Type Checking**: PDF/DOCX only
- **File Size Limits**: Configured in middleware

### CORS & Security Headers
```python
cors_allowed_origins = ["http://localhost:5173"]
```

### Data Protection
- SQLite file-based database (single tenant)
- No PII beyond email/name
- Local file storage only

---

## Deployment Architecture

### Development
```
Frontend: npm run dev → http://localhost:5173
Backend:  uvicorn main:app --reload → http://localhost:8000
Database: file:cv.db (auto-created)
```

### Production (Recommended)
```
Frontend: Built to dist/ → Served by Nginx/Apache
Backend:  Gunicorn + Uvicorn workers
Database: PostgreSQL (migration path)
```

### Environment Variables (.env)
```bash
DATABASE_URL=sqlite:///cv.db
SECRET_KEY=<jwt-signing-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days
```

---

## Key Design Decisions

1. **SQLite over PostgreSQL**: Simplifies deployment for MVP/single-user scenarios
2. **Client-side auth storage**: localStorage for tokens (acceptable for demo, consider httpOnly cookies for production)
3. **Single-page application**: Vite + React Router for seamless UX
4. **No microservices**: Monolithic FastAPI for simplicity
5. **Claymorphism design**: Modern light-mode aesthetic with tactile UI elements
6. **spaCy for NLP**: Efficient skill extraction without heavy ML models

---

## Future Scalability

### Short Term
- [ ] Migrate to PostgreSQL
- [ ] Add Redis caching for analysis results
- [ ] Implement email verification
- [ ] Add resume template marketplace

### Long Term
- [ ] Kubernetes deployment
- [ ] Separate analysis service (microservice)
- [ ] AI-powered cover letter generation
- [ ] LinkedIn profile integration
- [ ] Real-time job matching API

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Setup & usage instructions |
| `SYNOPSIS.md` | Project summary & features |
| `SYSTEM_ARCHITECTURE.md` | This file - technical architecture |
| `frontend/src/index.css` | Design system documentation (inline) |

---

**Last Updated**: April 2026  
**Version**: 2.0 (Claymorphism Design System)
