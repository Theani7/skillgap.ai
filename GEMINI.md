# SkillGap.ai - Project Context & Guidelines

SkillGap.ai is an enterprise-grade, full-stack SaaS platform that leverages advanced NLP and Generative AI (Google Gemini) to analyze resumes, predict career trajectories, and generate personalized learning roadmaps.

## Architecture Overview

### Backend (`api/`)
- **Framework**: FastAPI (Python 3.13+)
- **Database**: SQLite (`cv.db`). Connections are managed via a SQLAlchemy engine with `QueuePool`, but most queries use raw SQL for performance and simplicity.
- **AI Integration**: Google Gemini (`google-generativeai`) for high-level resume parsing, scoring, and roadmap generation.
- **Parsing**: Two-tier approach with local parsing (PyPDF2/python-docx) and Gemini fallback.
- **Authentication**: JWT-based. Dual token system:
  - Short-lived Access Token stored in `httpOnly` cookies.
  - Refresh Token stored in the database for persistence.
- **Security**: Password hashing via `passlib` (bcrypt). IP-based rate limiting via custom middleware.
- **Caching**: Analysis results are cached in the `analysis_cache` table using the SHA-256 hash of the resume content.

### Frontend (`frontend/`)
- **Framework**: React 19 with Vite.
- **Routing**: React Router DOM 7.
- **State Management**: `AuthContext` for authentication state.
- **Styling**: Vanilla-ish CSS using custom tokens (`src/styles/tokens.css`) and a theme system (`src/styles/theme.css`).
- **Visuals**: Recharts for data visualization, Framer Motion for animations, Lucide React for icons.

## Building and Running

### Prerequisites
- Node.js (v18+)
- Python (v3.13+)
- Google Gemini API Key

### Backend Setup
```bash
# From the project root
python -m venv venvapp
source venvapp/bin/activate  # Windows: venvapp\Scripts\activate
pip install -r api/requirements.txt
# Start the server
uvicorn api.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Configuration
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key_here
DB_FILE=api/cv.db
```

## Development Conventions

- **Database Operations**: Prefer using the `get_db()` context manager from `api/database.py`. Use raw SQL for complex queries but ensure parameterization to prevent injection.
- **New Endpoints**: Define routes in `api/main.py`. Use Pydantic models in `api/schemas.py` (if applicable, though current code often uses `Form` or `BaseModel` inline in `main.py`).
- **Frontend Components**: Use the design tokens defined in `src/styles/tokens.css`. Follow the "Claymorphism" aesthetic established in the existing components.
- **Error Handling**: Use the custom exceptions defined in `api/exceptions.py`. The backend has a centralized exception handler for `SkillGapException`.
- **Testing**: Add new tests to `api/tests/test_features.py`.

## Key Files
- `api/main.py`: Core API logic and route definitions.
- `api/database.py`: Database schema and connection management.
- `api/extractor.py`: Resume text extraction and Gemini parsing logic.
- `frontend/src/App.jsx`: Main routing and layout.
- `frontend/src/pages/Analyzer.jsx`: Primary resume processing UI.
