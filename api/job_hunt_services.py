from typing import Any, Dict, List, Optional
import re


I18N = {
    "en": {
        "feedback_prompt": "Tell us more",
        "analysis_complete": "Analysis Complete",
        "job_matches": "Recommended Job Matches",
    },
    "es": {
        "feedback_prompt": "Cuéntanos más",
        "analysis_complete": "Análisis completado",
        "job_matches": "Ofertas recomendadas",
    },
    "fr": {
        "feedback_prompt": "Dites-nous en plus",
        "analysis_complete": "Analyse terminée",
        "job_matches": "Offres recommandées",
    },
}


# ============ PARSER CONSTANTS ============

# Section header variants (lowercased, stripped of leading bullets/trailing colons).
# First match wins; multi-word headers are kept short (<= 40 chars in detector).
SECTION_HEADERS: Dict[str, List[str]] = {
    "experience": [
        "experience", "work experience", "professional experience",
        "work history", "employment", "employment history",
        "professional background", "career history", "relevant experience",
    ],
    "education": [
        "education", "academic", "academic background",
        "qualifications", "education & training", "education and training",
        "university", "educational background",
    ],
    "skills": [
        "skills", "technical skills", "technical stack",
        "core competencies", "competencies", "technologies",
        "skills & tools", "skills and tools", "tech skills",
        "key skills", "areas of expertise", "expertise",
    ],
    "projects": [
        "projects", "personal projects", "academic projects",
        "portfolio", "selected projects", "notable projects",
    ],
    "summary": [
        "summary", "profile", "objective", "about me",
        "professional summary", "career objective", "personal statement",
        "about", "overview",
    ],
    "certifications": [
        "certifications", "certificates", "licenses",
        "licenses & certifications", "licenses and certifications",
        "professional certifications", "credentials",
    ],
    "languages": [
        "languages", "language skills", "spoken languages",
    ],
    "awards": [
        "awards", "honors", "honors & awards", "honors and awards",
        "achievements", "recognition", "publications",
    ],
}

# Section canonical order — earlier wins on ambiguous header lines.
_SECTION_ORDER = ["summary", "experience", "education", "skills", "projects",
                  "certifications", "languages", "awards"]

# Synonym table for target-role → skills-taxonomy category mapping.
# Keys are lowercase role fragments; values are the categories whose skills
# should be treated as "target skills" for that role.
ROLE_SYNONYMS: Dict[str, List[str]] = {
    "backend": ["Web Frameworks", "Databases", "Other Technical", "Cloud & DevOps"],
    "back-end": ["Web Frameworks", "Databases", "Other Technical", "Cloud & DevOps"],
    "frontend": ["Web Frameworks", "Other Technical"],
    "front-end": ["Web Frameworks", "Other Technical"],
    "fullstack": ["Web Frameworks", "Databases", "Other Technical", "Cloud & DevOps"],
    "full-stack": ["Web Frameworks", "Databases", "Other Technical", "Cloud & DevOps"],
    "web developer": ["Web Frameworks", "Databases"],
    "web engineer": ["Web Frameworks", "Databases"],
    "react": ["Web Frameworks"],
    "react developer": ["Web Frameworks"],
    "react native": ["Web Frameworks", "Mobile Development"],
    "angular": ["Web Frameworks"],
    "vue": ["Web Frameworks"],
    "next.js": ["Web Frameworks"],
    "node": ["Web Frameworks", "Databases"],
    "node.js": ["Web Frameworks", "Databases"],
    "django": ["Web Frameworks", "Databases"],
    "flask": ["Web Frameworks"],
    "fastapi": ["Web Frameworks", "Databases"],
    "python developer": ["Programming Languages", "Web Frameworks"],
    "python engineer": ["Programming Languages", "Web Frameworks"],
    "java developer": ["Programming Languages", "Web Frameworks"],
    "java engineer": ["Programming Languages", "Web Frameworks"],
    "spring": ["Web Frameworks", "Databases"],
    "go developer": ["Programming Languages", "Web Frameworks"],
    "golang": ["Programming Languages", "Web Frameworks"],
    "rust": ["Programming Languages"],
    "ruby": ["Programming Languages", "Web Frameworks"],
    "rails": ["Web Frameworks", "Databases"],
    "php": ["Programming Languages", "Web Frameworks"],
    "ios": ["Mobile Development"],
    "ios developer": ["Mobile Development"],
    "android": ["Mobile Development"],
    "android developer": ["Mobile Development"],
    "mobile developer": ["Mobile Development"],
    "flutter": ["Mobile Development"],
    "swift": ["Mobile Development"],
    "kotlin": ["Mobile Development"],
    "data scientist": ["Data Science & AI"],
    "data science": ["Data Science & AI"],
    "data analyst": ["Data Science & AI"],
    "data engineer": ["Data Science & AI", "Databases", "Cloud & DevOps"],
    "ml engineer": ["Data Science & AI", "Cloud & DevOps"],
    "machine learning": ["Data Science & AI"],
    "ai engineer": ["Data Science & AI", "Cloud & DevOps"],
    "ai researcher": ["Data Science & AI"],
    "deep learning": ["Data Science & AI"],
    "nlp": ["Data Science & AI"],
    "computer vision": ["Data Science & AI"],
    "devops": ["Cloud & DevOps"],
    "sre": ["Cloud & DevOps"],
    "site reliability": ["Cloud & DevOps"],
    "cloud engineer": ["Cloud & DevOps"],
    "cloud architect": ["Cloud & DevOps"],
    "platform engineer": ["Cloud & DevOps"],
    "infrastructure": ["Cloud & DevOps"],
    "security engineer": ["Other Technical"],
    "cybersecurity": ["Other Technical"],
    "qa engineer": ["Other Technical"],
    "test engineer": ["Other Technical"],
    "sdet": ["Other Technical"],
    "software engineer": ["Programming Languages", "Web Frameworks", "Databases"],
    "software developer": ["Programming Languages", "Web Frameworks", "Databases"],
    "tech lead": ["Programming Languages", "Soft Skills"],
    "engineering manager": ["Soft Skills"],
    "engineering manager,": ["Soft Skills"],
    "cto": ["Soft Skills"],
    "product manager": ["Soft Skills"],
    "project manager": ["Soft Skills"],
    "scrum master": ["Soft Skills"],
}

# Date range detector — captures "Jan 2020 - Present", "2020 - 2023",
# "01/2020 - 12/2023", "Jan 2020 – Dec 2023", "Since 2020", etc.
MONTH = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*"
YEAR = r"(?:19|20)\d{2}"
DATE_RANGE_RE = re.compile(
    rf"""
    (?P<start>
        {MONTH}\s+{YEAR}
        | {YEAR}
        | \d{{1,2}}/\d{{4}}
        | present|current|now
    )
    \s*(?:-|–|—|to|until|—)\s*
    (?P<end>
        {MONTH}\s+{YEAR}
        | {YEAR}
        | \d{{1,2}}/\d{{4}}
        | present|current|now
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)
SINGLE_DATE_RE = re.compile(rf"(?:since\s+)?({MONTH}\s+{YEAR}|{YEAR})", re.IGNORECASE)

# Phone — require country code or area code in (parens), 10-11 digits total
PHONE_RE = re.compile(
    r"""
    (?:\+?\d{1,3}[\s.\-]?)?
    (?:\(\d{2,4}\)|\d{2,4})
    [\s.\-]?
    \d{3,4}
    [\s.\-]?
    \d{3,5}
    (?:[\s.\-]?\d{1,5})?
    """,
    re.VERBOSE,
)

# Name — 2-4 capitalized words, no digits, no noise chars, max 60 chars
NAME_RE = re.compile(
    r"^[A-Z][a-zA-ZÀ-ÿ'\-]+(?:\s+[A-Z][a-zA-ZÀ-ÿ'\-\.]+){1,3}$"
)
NOISE_LINE_RE = re.compile(
    r"(resume|curriculum|vitae|profile|@|http|www\.|phone|email|tel:|mobile|address)",
    re.IGNORECASE,
)

# Education degree keywords
DEGREE_KEYWORDS = [
    "PhD", "Ph.D", "Doctor of", "Doctorate",
    "MBA", "M.B.A.",
    "Master of", "M.S.", "M.Sc.", "MA", "M.A.", "M.Eng.", "M.Tech", "MSc",
    "Bachelor of", "B.S.", "B.Sc.", "BA", "B.A.", "B.Eng.", "B.Tech", "BSc",
    "Associate of", "A.S.", "A.A.",
    "Diploma in", "Higher National Diploma", "HND",
]
# Use negative lookbehind/ahead (not \b) because trailing period in "B.S." sits
# between two non-word chars, so \b never matches there.
DEGREE_RE = re.compile(
    r"(?<![\w])(" + "|".join(re.escape(d) for d in DEGREE_KEYWORDS) + r")(?![\w])",
    re.IGNORECASE,
)

# Bullets (leading char sets) — used by the experience parser to separate
# header lines from bullet lines
BULLET_PREFIX_RE = re.compile(r"^[\s\-\•\·\*▪►▸→]+")

# Job title keywords (used to identify title lines inside an experience entry)
TITLE_KEYWORDS = [
    "engineer", "developer", "architect", "manager", "lead", "head",
    "director", "consultant", "analyst", "scientist", "designer",
    "administrator", "specialist", "officer", "intern", "associate",
    "founder", "co-founder", "researcher", "principal", "staff",
    "senior", "junior", "vp", "chief", "coo", "cto", "ceo", "cfo", "cio",
    "product owner", "scrum master", "programmer", "technician",
    "data analyst", "data scientist", "data engineer", "ml engineer",
    "sre", "devops", "qa", "sdet", "scientist", "writer", "editor",
]

# Section content key → return-dict key
SECTION_RETURN_KEY = {
    "experience": "experience_blocks",
    "education": "education_blocks",
    "certifications": "certifications",
    "languages": "languages",
    "awards": "awards",
}


def compare_resume_to_jd(resume_skills: List[str], jd_text: str) -> Dict[str, Any]:
    resume_set = {s.lower().strip() for s in (resume_skills or []) if s}
    jd_tokens = {token.strip(".,:;()[]{}").lower() for token in jd_text.split()}
    strong_keywords = [kw for kw in jd_tokens if len(kw) > 3]
    matched = sorted([kw for kw in strong_keywords if kw in resume_set])[:40]
    missing = sorted([kw for kw in strong_keywords if kw not in resume_set])[:40]
    coverage = 0
    if strong_keywords:
        coverage = int((len(matched) / len(set(strong_keywords))) * 100)
    return {"coverage_score": coverage, "matched_keywords": matched, "missing_keywords": missing}


# ============ FALLBACK FUNCTIONS ============

from api.skills_taxonomy import ALL_SKILLS, SKILLS_TAXONOMY

# Canonical alias → taxonomy skill name.
# Each key is a variation users write on resumes; the value is the canonical
# skill in ALL_SKILLS / SKILLS_TAXONOMY.  Checked word-boundary-insensitively.
_SKILL_ALIASES: Dict[str, str] = {
    # Languages
    "js": "javascript", "ts": "typescript", "golang": "go", "rb": "ruby",
    "c sharp": "c#", "dot net": "asp.net", ".net": "asp.net", "objc": "objective-c",
    "py": "python", "rs": "rust", "kt": "kotlin",
    # Frameworks
    "react.js": "react", "reactjs": "react", "nextjs": "next.js", "next": "next.js",
    "vue.js": "vue", "vuejs": "vue", "nuxt": "nuxt.js", "nuxtjs": "nuxt.js",
    "angular.js": "angular", "angularjs": "angular",
    "svelte.js": "svelte", "sveltejs": "svelte",
    "node": "express", "nodejs": "express", "express.js": "express",
    "django rest": "django", "drf": "django", "flask api": "flask",
    "spring": "spring boot", "springframework": "spring boot",
    "rails": "ruby on rails", "ruby on rails": "ruby on rails",
    "laravel php": "laravel", "asp net": "asp.net",
    "tailwindcss": "tailwind", "tw": "tailwind",
    "jetpackcompose": "jetpack compose",
    "swiftui": "swiftui", "uikit": "ios",
    # Databases
    "postgres": "postgresql", "pg": "postgresql", "psql": "postgresql",
    "mongo": "mongodb", "mongo db": "mongodb",
    "elastic": "elasticsearch", "elastic search": "elasticsearch", "es": "elasticsearch",
    "mariadb": "mariadb", "mssql": "sql",
    "dynamo": "dynamodb", "dynamo db": "dynamodb",
    "firebase rtdb": "firebase", "firestore": "firebase",
    "sqlite3": "sqlite",
    # Cloud & DevOps
    "amazon web services": "aws", "ec2": "aws", "s3": "aws", "lambda": "aws",
    "google cloud": "gcp", "google cloud platform": "gcp", "gke": "gcp",
    "microsoft azure": "azure", "azure devops": "azure",
    "k8s": "kubernetes", "kube": "kubernetes",
    "ci/cd pipelines": "ci/cd", "cicd": "ci/cd", "continuous integration": "ci/cd",
    "jenkins": "jenkins", "github actions": "github",
    "terraform.io": "terraform", "tf": "terraform",
    "prom": "prometheus", "graf": "grafana",
    "nginx": "nginx", "apache": "nginx",
    # Data & AI
    "ml": "machine learning", "machinelearning": "machine learning",
    "dl": "deep learning", "deeplearning": "deep learning",
    "nlp": "nlp", "natural language processing": "nlp",
    "cv": "computer vision", "computer vision": "computer vision",
    "sklearn": "scikit-learn", "scikit learn": "scikit-learn",
    "tf": "tensorflow", "keras": "tensorflow",
    "torch": "pytorch", "py torch": "pytorch",
    "pandas": "pandas", "np": "numpy", "numpy": "numpy",
    "mpl": "matplotlib", "seaborn": "seaborn",
    "tableau": "tableau", "powerbi": "power bi",
    # Mobile
    "rn": "react native", "reactnative": "react native",
    "flutter.io": "flutter", "dart-lang": "dart",
    "xamarine": "xamarin",
    # Soft skills & process
    "scrum": "scrum", "kanban": "kanban", "agile/scrum": "agile",
    "jira": "agile", "trello": "agile",
    "figma": "figma", "sketch": "figma", "adobe xd": "figma",
    # Other
    "rest": "rest api", "restful": "rest api", "restapi": "rest api",
    "graph ql": "graphql", "graphql": "graphql",
    "micro services": "microservices", "micro-service": "microservices",
    "unit tests": "unit testing", "integration tests": "integration testing",
    "i.o.t.": "iot", "internet of things": "iot",
    "block chain": "blockchain",
    "pen testing": "security", "infosec": "security", "cybersecurity": "security",
    "load balancer": "aws", "cdn": "aws",
    "posix": "linux", "ubuntu": "linux", "centos": "linux", "debian": "linux",
    "bash": "shell", "zsh": "shell", "powershell": "powershell",
}


def fuzzy_skill_match(text: str, skill: str) -> bool:
    """Check for skill with word boundaries and common variations."""
    pattern = rf'\b{re.escape(skill)}\b'
    if re.search(pattern, text, re.IGNORECASE):
        return True
    # Check the alias table — if the canonical skill matches an alias, search for it
    canonical = _SKILL_ALIASES.get(skill.lower(), skill)
    if canonical != skill.lower():
        pattern2 = rf'\b{re.escape(canonical)}\b'
        if re.search(pattern2, text, re.IGNORECASE):
            return True
    # Also check all aliases that map TO this skill
    for alias, target in _SKILL_ALIASES.items():
        if target == skill.lower() and alias != skill.lower():
            if re.search(rf'\b{re.escape(alias)}\b', text, re.IGNORECASE):
                return True
    return False


def _detect_section(line_lower: str) -> Optional[str]:
    """Return canonical section name if `line_lower` is a section header, else None.

    Strips leading bullet characters (•, ·, -, *, ▪) and trailing punctuation,
    then word-boundary matches against SECTION_HEADERS.
    """
    cleaned = re.sub(r"^[\s\-\•\·\*▪►▸→]+", "", line_lower).strip().rstrip(":.,;")
    if not cleaned or len(cleaned) > 40:
        return None
    # Walk in canonical order so e.g. "Work Experience" beats "Experience"
    for sec in _SECTION_ORDER:
        for header in SECTION_HEADERS[sec]:
            if re.search(rf"\b{re.escape(header)}\b", cleaned):
                return sec
    return None


def _extract_company_from_line(line: str) -> Optional[str]:
    """Extract company from a 'Title at Company' or 'Title - Company' or 'Title, Company' line."""
    # "Title at Company" / "Title @ Company"
    m = re.search(r"(?:\s+at\s+|\s+@\s+)([A-Z][\w&.,'\- ]{1,60})", line)
    if m:
        return m.group(1).strip().rstrip(",.;")
    # "Title - Company" / "Title — Company" (em-dash)
    m = re.search(r"\s+[\-–—]\s+([A-Z][\w&.,'\- ]{1,60})$", line)
    if m:
        return m.group(1).strip().rstrip(",.;")
    # "Title, Company" (comma only if no year present)
    if "," in line and not re.search(r"\b(?:19|20)\d{2}\b", line):
        parts = [p.strip() for p in line.split(",") if p.strip()]
        if len(parts) == 2:
            return parts[1]
    return None


def _looks_like_title(line: str) -> bool:
    lower = line.lower()
    return any(kw in lower for kw in TITLE_KEYWORDS)


def _parse_experience_blocks(lines: List[str]) -> List[Dict[str, Any]]:
    """Group raw experience-section lines into {title, company, start_date, end_date, bullets}.

    Algorithm:
      1. Find every line that contains a date range — each one marks an entry boundary.
      2. For each entry, scan BACKWARDS from the date line to collect contiguous
         header lines (no bullets, < 100 chars, no blank lines in between).
         Convention: with 2+ header lines, line[0] is the title and line[-1] is the
         company. With 1 header line, try to extract via "at / @ / -" separator.
      3. Scan FORWARDS from the date line (to the next date or section end) to
         collect bullet lines (anything that isn't another date or a new entry's
         title-style header line).
      4. If a date line also contains the title/company on the same line (e.g.
         "Senior Engineer at Acme, Jan 2020 - Present"), extract from the line
         itself by stripping the date match.
    """
    # Step 1: locate every date-line index
    date_positions: List[tuple] = []  # [(idx, match), ...]
    for i, raw in enumerate(lines):
        stripped = BULLET_PREFIX_RE.sub("", raw.strip(), count=1).strip()
        m = DATE_RANGE_RE.search(stripped)
        if m:
            date_positions.append((i, m, stripped))

    if not date_positions:
        # No dates found — return empty list (don't synthesize a phantom block)
        return []

    blocks: List[Dict[str, Any]] = []
    for k, (idx, m, stripped) in enumerate(date_positions):
        # Step 2: collect header lines by scanning backwards
        header_lines: List[str] = []
        j = idx - 1
        while j >= 0:
            prev = lines[j].strip()
            if not prev:
                break
            if BULLET_PREFIX_RE.match(prev):
                break
            if len(prev) > 100:
                break
            header_lines.insert(0, prev)
            j -= 1

        # If the date line itself has title/company content, extract it
        same_line_header = stripped.replace(m.group(0), "").strip(" ,-–—")
        same_line_company = _extract_company_from_line(same_line_header) or ""
        same_line_title = ""
        if same_line_company and same_line_header.endswith(same_line_company):
            same_line_title = same_line_header[: -len(same_line_company)].rstrip(" ,-–—@at").strip()
        elif same_line_company:
            same_line_title = re.sub(
                rf"(\s+at\s+|\s+@\s+|\s+[\-–—]\s+){re.escape(same_line_company)}\s*$",
                "", same_line_header, flags=re.IGNORECASE,
            ).strip().rstrip(",;")
        else:
            same_line_title = same_line_header

        # Merge: prefer explicit header_lines, fall back to same_line extraction
        title, company = "", ""
        if len(header_lines) >= 2:
            title = header_lines[0]
            company = header_lines[1]
        elif len(header_lines) == 1:
            company = _extract_company_from_line(header_lines[0]) or ""
            if company and header_lines[0].endswith(company):
                title = header_lines[0][: -len(company)].rstrip(" ,-–—@at").strip()
            else:
                title = header_lines[0]
        elif same_line_title or same_line_company:
            title = same_line_title
            company = same_line_company

        # Step 3: collect bullet lines by scanning forwards to the next date
        bullets: List[str] = []
        next_idx = date_positions[k + 1][0] if k + 1 < len(date_positions) else len(lines)
        j = idx + 1
        while j < next_idx:
            raw_line = lines[j].strip()
            if not raw_line:
                j += 1
                continue
            bullet_clean = BULLET_PREFIX_RE.sub("", raw_line, count=1).strip()
            # Stop if this line is another date (shouldn't happen — next_idx catches it)
            if DATE_RANGE_RE.search(bullet_clean):
                break
            bullets.append(bullet_clean)
            j += 1

        # Extract start/end
        try:
            start = m.group("start") or ""
            end = m.group("end") or ""
        except (IndexError, AttributeError):
            start = m.group(1) or ""
            end = ""

        blocks.append({
            "title": title.strip(),
            "company": company.strip(),
            "start_date": start.strip(),
            "end_date": end.strip(),
            "bullets": bullets,
        })

    return blocks


def _entry_from_header_and_bullets(header_lines, bullet_lines, date_text=""):
    """Build a single experience entry when no date marker exists."""
    title, company = "", ""
    if len(header_lines) >= 2:
        title = header_lines[0]
        company = header_lines[1]
    elif header_lines:
        company = _extract_company_from_line(header_lines[0]) or ""
        if company and header_lines[0].endswith(company):
            title = header_lines[0][: -len(company)].rstrip(" ,-–—@at").strip()
        else:
            title = header_lines[0]
    return {
        "title": title.strip(),
        "company": company.strip(),
        "start_date": "",
        "end_date": "",
        "bullets": [BULLET_PREFIX_RE.sub("", b.strip(), count=1).strip() for b in bullet_lines if b.strip()],
    }


def _parse_education_blocks(lines: List[str]) -> List[Dict[str, Any]]:
    """Group education lines into {degree, institution, year} entries."""
    blocks: List[Dict[str, Any]] = []
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        degree = ""
        m = DEGREE_RE.search(line)
        if m:
            degree = m.group(0)

        # Year — first 4-digit year in [19|20]\d{2}
        year_match = re.search(r"\b(?:19|20)\d{2}\b", line)
        year = year_match.group(0) if year_match else ""

        # Institution — everything else, stripped of degree/year
        institution = line
        if degree:
            institution = institution.replace(degree, "").strip(" ,-–—")
        if year:
            institution = re.sub(rf"\b{year}\b", "", institution).strip(" ,-–—")
        # Clean stray separators and "in/from" preambles
        institution = re.sub(
            r"^(?:in|from|at|,)\s+", "", institution, flags=re.IGNORECASE,
        ).strip(" ,-–—")
        if not institution:
            institution = line

        blocks.append({
            "degree": degree,
            "institution": institution,
            "year": year,
        })
    return blocks


def _detect_name(lines: List[str]) -> str:
    """Find the candidate's name in the first few non-empty lines.

    Heuristic: 2-4 words, each Title-Case, no digits, no email/url chars,
    not matching a section header.
    """
    for line in lines[:5]:
        candidate = line.strip()
        if not candidate or len(candidate) > 60:
            continue
        if NOISE_LINE_RE.search(candidate):
            continue
        # Must look like a name
        if not NAME_RE.match(candidate):
            continue
        # Don't match section headers
        if _detect_section(candidate.lower()):
            continue
        return candidate
    return "Unknown"


def _tighten_phone(text: str) -> str:
    """Return a phone number if one is present and well-formed, else ''."""
    candidates: List[str] = []
    for m in PHONE_RE.finditer(text):
        raw = m.group(0).strip()
        digits = re.sub(r"\D", "", raw)
        # Accept 10-15 digits (international formats)
        if 10 <= len(digits) <= 15:
            # Reject if it's clearly a year (4 digits surrounded by spaces)
            if len(digits) == 4:
                continue
            candidates.append(raw)
    if not candidates:
        return ""
    # Prefer the one that contains + or parens
    for c in candidates:
        if "+" in c or "(" in c:
            return c
    return candidates[0]


def _target_categories_for_role(target_role: str) -> List[str]:
    """Map a target role string to a list of skill-taxonomy categories."""
    if not target_role:
        return ["Other Technical"]
    role_lower = target_role.lower()
    # Try ROLE_SYNONYMS — match on the longest fragment first
    matched_categories: List[str] = []
    fragments = sorted(ROLE_SYNONYMS.keys(), key=len, reverse=True)
    for frag in fragments:
        if frag in role_lower:
            matched_categories = list(dict.fromkeys(ROLE_SYNONYMS[frag]))  # dedupe preserving order
            return matched_categories
    # Fallback: original behavior
    for cat in SKILLS_TAXONOMY:
        if any(s in role_lower for s in cat.lower().split()):
            return [cat]
    return ["Other Technical"]


def _compute_local_match_score(
    found_skills: List[str], target_role: Optional[str]
) -> int:
    """Compute a directional match score from overlap with the role's category skills.

    We deliberately don't divide by `len(target_skills)`, because the union of
    3-4 taxonomy categories can yield 50+ "target" skills — dividing makes even
    a strong resume look like 10% overlap. Instead, we use overlap as a direct
    signal with reasonable bounds:

        0 matches → 35
        5 matches → 75
        8+ matches → 95 (cap)
    """
    if not target_role:
        return 70
    categories = _target_categories_for_role(target_role)
    target_skills: List[str] = []
    for cat in categories:
        target_skills.extend(SKILLS_TAXONOMY.get(cat, []))
    if not target_skills:
        return 50
    found_lower = {s.lower() for s in found_skills}
    overlap = sum(1 for s in target_skills if s.lower() in found_lower)
    return max(25, min(95, 35 + overlap * 8))


# Difficulty ratings for skills (1=beginner, 2=intermediate, 3=advanced).
# Used by prioritization and roadmap generation.
_SKILL_DIFFICULTY: Dict[str, int] = {
    # Beginner (1)
    "html": 1, "css": 1, "git": 1, "linux": 1, "agile": 1, "scrum": 1,
    "communication": 1, "leadership": 1, "problem solving": 1, "teamwork": 1,
    "time management": 1, "public speaking": 1, "critical thinking": 1,
    "adaptability": 1, "mentoring": 1, "project management": 1,
    "sql": 1, "excel": 1, "power bi": 1,
    # Intermediate (2)
    "javascript": 2, "python": 2, "java": 2, "react": 2, "angular": 2,
    "vue": 2, "node.js": 2, "django": 2, "flask": 2, "fastapi": 2,
    "spring boot": 2, "express": 2, "laravel": 2,
    "mysql": 2, "postgresql": 2, "mongodb": 2, "redis": 2, "sqlite": 2,
    "docker": 2, "aws": 2, "azure": 2, "gcp": 2,
    "rest api": 2, "graphql": 2, "json": 2, "xml": 2,
    "testing": 2, "unit testing": 2, "integration testing": 2,
    "pandas": 2, "numpy": 2, "matplotlib": 2, "seaborn": 2,
    "flutter": 2, "react native": 2, "kotlin": 2, "swift": 2,
    "tailwind": 2, "bootstrap": 2, "jquery": 2,
    "jenkins": 2, "github": 2, "gitlab": 2,
    "terraform": 2, "ansible": 2,
    "figma": 2, "sketch": 2,
    # Advanced (3)
    "machine learning": 3, "deep learning": 3, "nlp": 3, "computer vision": 3,
    "tensorflow": 3, "pytorch": 3, "scikit-learn": 3,
    "kubernetes": 3, "microservices": 3, "ci/cd": 3,
    "elasticsearch": 3, "cassandra": 3, "dynamodb": 3, "neo4j": 3,
    "typescript": 3, "go": 3, "rust": 3, "scala": 3,
    "spark": 3, "hadoop": 3, "kafka": 3, "airflow": 3,
    "prometheus": 3, "grafana": 3, "nginx": 3,
    "security": 3, "blockchain": 3, "iot": 3,
}


def prioritize_missing_skills(
    missing_skills: List[str], target_role: Optional[str], found_skills: List[str]
) -> List[Dict[str, Any]]:
    """Score and sort missing skills by importance, difficulty, and market demand.

    Returns a list of dicts: [{skill, priority_score, difficulty, reason}, ...]
    sorted by priority_score descending.
    """
    if not missing_skills:
        return []

    target_categories = _target_categories_for_role(target_role)
    # Build a set of which categories each missing skill belongs to
    skill_to_cats: Dict[str, List[str]] = {}
    for cat in target_categories:
        for s in SKILLS_TAXONOMY.get(cat, []):
            skill_to_cats.setdefault(s.lower(), []).append(cat)

    found_lower = {s.lower() for s in found_skills}
    scored: List[Dict[str, Any]] = []

    for skill in missing_skills:
        sl = skill.lower()
        cats = skill_to_cats.get(sl, [])
        difficulty = _SKILL_DIFFICULTY.get(sl, 2)

        # Priority factors:
        # 1. Category count — skills in more target categories are more important
        cat_score = min(5, len(cats))

        # 2. Foundational check — if user is missing a "basic" skill for the role,
        #    it should be flagged as critical
        foundational = difficulty == 1
        foundational_bonus = 3 if foundational else 0

        # 3. Adjacent-skill bonus — if user has related skills, this gap is easier to close
        #    (prioritize gaps where user already has adjacent skills)
        adjacent_skills = set()
        if sl in {"react", "angular", "vue", "svelte", "next.js", "nuxt.js"}:
            adjacent_skills = {"html", "css", "javascript", "typescript"}
        elif sl in {"django", "flask", "fastapi", "spring boot", "express", "laravel"}:
            adjacent_skills = {"python", "java", "javascript", "node.js"}
        elif sl in {"docker", "kubernetes", "terraform", "ansible"}:
            adjacent_skills = {"linux", "aws", "azure", "gcp", "ci/cd"}
        elif sl in {"machine learning", "deep learning", "nlp", "computer vision"}:
            adjacent_skills = {"python", "numpy", "pandas", "statistics"}
        elif sl in {"tensorflow", "pytorch", "scikit-learn"}:
            adjacent_skills = {"python", "machine learning", "numpy"}
        elif sl in {"postgresql", "mysql", "mongodb", "redis", "elasticsearch"}:
            adjacent_skills = {"sql", "docker", "linux"}
        elif sl in {"aws", "azure", "gcp"}:
            adjacent_skills = {"linux", "docker", "terraform"}

        has_adjacent = bool(adjacent_skills & found_lower)
        adjacent_bonus = 2 if has_adjacent else 0

        # Combined priority score
        priority = cat_score + foundational_bonus + adjacent_bonus

        # Difficulty label
        diff_label = "beginner" if difficulty == 1 else "intermediate" if difficulty == 2 else "advanced"

        # Reason
        reasons = []
        if foundational:
            reasons.append("foundational skill for this role")
        if cat_score >= 3:
            reasons.append(f"required across {len(cats)} target areas")
        if has_adjacent:
            reasons.append("you have adjacent skills — easier to learn")
        if not reasons:
            reasons.append("commonly required for this role")

        scored.append({
            "skill": skill,
            "priority_score": priority,
            "difficulty": diff_label,
            "reason": "; ".join(reasons),
        })

    # Sort by priority_score desc, then difficulty asc (easier first)
    diff_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
    scored.sort(key=lambda x: (-x["priority_score"], diff_order.get(x["difficulty"], 1)))
    return scored


def generate_personalized_roadmap(
    target_role: str, found_skills: List[str], missing_skills: List[str]
) -> List[dict]:
    """Generate a 4-phase learning roadmap based on the user's actual skill gaps.

    Unlike the old generic template, this:
      - Uses actual missing skills, not hardcoded ones
      - Groups skills by difficulty (easy → hard)
      - Assigns realistic durations based on skill count and complexity
      - Provides specific action items for each skill
    """
    role = target_role or "Professional"
    prioritized = prioritize_missing_skills(missing_skills, target_role, found_skills)

    if not prioritized:
        # No gaps — suggest mastery-level steps
        return [
            {
                "step": 1,
                "title": "Skill Deepening",
                "duration": "3 weeks",
                "skills": found_skills[:3] if found_skills else ["Advanced Architecture"],
                "action_items": [
                    f"Take an advanced course in {found_skills[0] if found_skills else 'system design'}.",
                    "Build a production-grade project showcasing depth.",
                ],
            },
            {
                "step": 2,
                "title": "Open Source & Portfolio",
                "duration": "4 weeks",
                "skills": ["Open Source", "Portfolio"],
                "action_items": [
                    "Contribute to an open-source project in your domain.",
                    "Write technical blog posts about your projects.",
                ],
            },
            {
                "step": 3,
                "title": "Leadership & Mentorship",
                "duration": "3 weeks",
                "skills": ["Technical Leadership", "Code Review"],
                "action_items": [
                    "Mentor a junior developer on a project.",
                    "Lead a code review session or architecture discussion.",
                ],
            },
            {
                "step": 4,
                "title": "Career Positioning",
                "duration": "2 weeks",
                "skills": ["Interview Prep", "Networking"],
                "action_items": [
                    "Update LinkedIn and portfolio with new skills.",
                    "Practice system design and behavioral interviews.",
                ],
            },
        ]

    # Group by difficulty
    beginner = [p for p in prioritized if p["difficulty"] == "beginner"]
    intermediate = [p for p in prioritized if p["difficulty"] == "intermediate"]
    advanced = [p for p in prioritized if p["difficulty"] == "advanced"]

    # Split into 4 phases
    total = len(prioritized)
    phases = [
        {
            "step": 1,
            "title": "Foundation & Quick Wins",
            "duration": f"{max(2, len(beginner) + 1)} weeks",
            "skills": [p["skill"] for p in beginner[:3]] or [p["skill"] for p in prioritized[:2]],
            "action_items": [],
        },
        {
            "step": 2,
            "title": "Core Skill Building",
            "duration": f"{max(3, len(intermediate) + 2)} weeks",
            "skills": [p["skill"] for p in intermediate[:3]] or [p["skill"] for p in prioritized[2:5]],
            "action_items": [],
        },
        {
            "step": 3,
            "title": "Advanced Topics & Projects",
            "duration": f"{max(3, len(advanced) + 2)} weeks",
            "skills": [p["skill"] for p in advanced[:3]] or [p["skill"] for p in prioritized[5:8]],
            "action_items": [],
        },
        {
            "step": 4,
            "title": "Portfolio & Interview Prep",
            "duration": "2-3 weeks",
            "skills": ["Portfolio Projects", "Interview Practice"],
            "action_items": [],
        },
    ]

    # Generate specific action items for each phase
    for phase in phases:
        skills = phase["skills"]
        items = []
        if skills and skills[0] != "Portfolio Projects":
            items.append(f"Complete an online course or tutorial in {skills[0]}.")
            if len(skills) > 1:
                items.append(f"Practice {skills[1]} through a small hands-on project.")
            items.append("Document what you learned and add to your portfolio.")
        else:
            items = [
                "Build 1-2 portfolio projects demonstrating your new skills.",
                "Practice mock interviews focusing on system design.",
                "Update your resume and LinkedIn with newly acquired skills.",
            ]
        phase["action_items"] = items

    return phases

def generate_synthetic_roadmap(target_role: str, found_skills: List[str]) -> List[dict]:
    """Generates a structured career roadmap using local logic when AI is unavailable."""
    role = target_role or "Professional"
    # Determine missing skills based on taxonomy (simplified)
    role_category = "Other Technical"
    for cat, skills in SKILLS_TAXONOMY.items():
        if any(s in role.lower() for s in cat.lower().split()):
            role_category = cat
            break
    
    potential_missing = [s for s in SKILLS_TAXONOMY[role_category] if s.title() not in found_skills]
    if not potential_missing:
        potential_missing = ["Advanced Architecture", "System Design", "Leadership", "Performance Optimization"]

    return [
        {
            "step": 1,
            "title": "Closing Core Gaps",
            "duration": "4 weeks",
            "skills": potential_missing[:2],
            "action_items": [f"Complete an advanced certification in {potential_missing[0]}", "Build a small CLI tool to practice."]
        },
        {
            "step": 2,
            "title": "Applied Projects",
            "duration": "6 weeks",
            "skills": potential_missing[2:4] if len(potential_missing) > 2 else ["Project Execution"],
            "action_items": ["Integrate new skills into a full-stack portfolio project.", "Open source a component on GitHub."]
        },
        {
            "step": 3,
            "title": "Scale & Optimization",
            "duration": "3 weeks",
            "skills": ["Performance", "Security", "Testing"],
            "action_items": ["Implement unit tests and CI/CD pipelines.", "Optimize application latency."]
        },
        {
            "step": 4,
            "title": "Market Readiness",
            "duration": "2 weeks",
            "skills": ["Interviewing", "Networking"],
            "action_items": ["Update LinkedIn with new portfolio projects.", "Practice mock interviews focusing on system design."]
        }
    ]

def parse_resume_fallback(
    text: str,
    target_role: str = None,
    file_path: Optional[str] = None,
) -> dict:
    """
    Hybrid Resume Parser (v3).

    Produces a structured JSON payload matching the shape Gemini returns, using
    only local heuristics — no LLM calls. Used both as a high-confidence fast
    path (skips Gemini) and as a graceful fallback when Gemini is unavailable
    or rate-limited.

    Features:
      - Section detection with word-boundary header matching
      - Structured experience blocks: {title, company, start_date, end_date, bullets}
      - Structured education blocks: {degree, institution, year}
      - Job-title & company name extraction (populates designation + company_names)
      - Tightened phone regex (10-15 digits, requires + or parens, length-capped)
      - Name detection v2 (2-4 Title-Case words, first 5 lines)
      - Real match score (overlap with target-role category skills, 25-100)
      - Real page count for PDFs (via optional file_path)
      - Certifications / Languages / Awards sections captured separately
      - Target-role mapping via ROLE_SYNONYMS (covers common job titles)
    """
    text_lower = text.lower()
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # 1. Section detection (improved — word-boundary, 40-char tolerance)
    sections: Dict[str, Any] = {
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "summary": "",
        "certifications": [],
        "languages": [],
        "awards": [],
    }
    current_section: Optional[str] = None

    for line in lines:
        sec = _detect_section(line.lower())
        if sec is not None:
            current_section = sec
            continue
        if current_section is None:
            continue
        if current_section == "summary":
            sections["summary"] += line + " "
        else:
            sections[current_section].append(line)

    # 2. Entity extraction
    email_match = re.search(r'[\w.+-]+@[\w.-]+\.\w+', text)
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text_lower)
    github_match = re.search(r'github\.com/[\w-]+', text_lower)
    phone = _tighten_phone(text)

    # 3. Skill extraction (taxonomy + fuzzy variants)
    found_skills: List[str] = []
    seen_lower: set = set()
    for skill in ALL_SKILLS:
        if fuzzy_skill_match(text_lower, skill):
            t = skill.title()
            if t.lower() not in seen_lower:
                seen_lower.add(t.lower())
                found_skills.append(t)

    # 4. Name detection v2
    name = _detect_name(lines)

    # 5. Structured experience & education blocks
    experience_blocks = _parse_experience_blocks(sections["experience"])
    education_blocks = _parse_education_blocks(sections["education"])

    # Also emit "flat" string lists for backward-compat with downstream code
    # that consumes resume_data.get("experience") as a list of strings.
    experience_flat: List[str] = []
    for b in experience_blocks:
        head = " — ".join(filter(None, [b.get("title"), b.get("company")]))
        dates = " — ".join(filter(None, [b.get("start_date"), b.get("end_date")]))
        if head and dates:
            experience_flat.append(f"{head} ({dates})")
        elif head:
            experience_flat.append(head)
        for bullet in b.get("bullets", []):
            experience_flat.append(f"  • {bullet}")
    if not experience_flat:
        experience_flat = sections["experience"][:10]

    education_flat: List[str] = []
    for b in education_blocks:
        head = " — ".join(filter(None, [b.get("degree"), b.get("institution")]))
        if b.get("year"):
            head = f"{head} ({b['year']})" if head else b["year"]
        if head:
            education_flat.append(head)
    if not education_flat:
        education_flat = sections["education"][:5]

    # 6. Designation + company_names from experience blocks
    designations = [b["title"] for b in experience_blocks if b.get("title")]
    company_names = [b["company"] for b in experience_blocks if b.get("company")]

    # 7. Missing skills for target role (prioritized by importance)
    target_categories = _target_categories_for_role(target_role)
    target_skills: List[str] = []
    for cat in target_categories:
        target_skills.extend(SKILLS_TAXONOMY.get(cat, []))
    raw_missing = [s for s in target_skills if s.title() not in found_skills]
    prioritized = prioritize_missing_skills(raw_missing, target_role, found_skills)
    missing_skills = [p["skill"] for p in prioritized[:8]]

    # 8. Match score (real, not static)
    match_score = _compute_local_match_score(found_skills, target_role)

    # 8b. Personalized roadmap based on actual gaps
    roadmap = generate_personalized_roadmap(target_role, found_skills, raw_missing)

    # 9. Page count (PDFs only — caller must pass file_path)
    no_of_pages = 1
    if file_path and file_path.lower().endswith(".pdf"):
        try:
            import pypdf
            no_of_pages = max(1, len(pypdf.PdfReader(file_path).pages))
        except Exception:
            pass

    # 10. Confidence scoring (more nuanced)
    confidence = 0
    if name != "Unknown":
        confidence += 20
    if email_match:
        confidence += 20
    if phone:
        confidence += 5
    if len(found_skills) >= 5:
        confidence += 25
    elif found_skills:
        confidence += 10
    if experience_blocks:
        confidence += 15
        if any(b.get("company") for b in experience_blocks):
            confidence += 5
    if education_blocks:
        confidence += 10
        if any(b.get("degree") for b in education_blocks):
            confidence += 5
    if sections["summary"].strip():
        confidence += 5
    confidence = min(100, confidence)

    return {
        "name": name,
        "email": email_match.group(0) if email_match else "",
        "mobile_number": phone,
        "skills": found_skills,
        "education": education_flat,
        "experience": experience_flat,
        "designation": designations,
        "company_names": company_names,
        "missing_skills": missing_skills,
        "match_score": match_score,
        "roadmap": roadmap,
        "links": {
            "linkedin": f"https://{linkedin_match.group(0)}" if linkedin_match else "",
            "github": f"https://{github_match.group(0)}" if github_match else "",
        },
        "summary": sections["summary"].strip(),
        "no_of_pages": no_of_pages,
        "experience_blocks": experience_blocks,
        "education_blocks": education_blocks,
        "certifications": sections["certifications"],
        "languages": sections["languages"],
        "awards": sections["awards"],
        "confidence_score": confidence,
        "parsing_method": "local_hybrid_v3",
    }


def rewrite_resume_fallback(resume_data: dict, target_role: str = None) -> dict:
    """Fallback resume rewriter using templates"""
    role = target_role or "Professional"
    name = resume_data.get("name", "Candidate")
    skills = resume_data.get("skills", [])
    original_exp = resume_data.get("experience", [])
    
    # Generate stronger action verbs for bullet points
    strong_verbs = ["Led", "Built", "Developed", "Implemented", "Optimized", "Delivered", "Managed", "Created", "Established", "Spearheaded"]
    
    rewritten_exp = []
    for exp in original_exp[:5]:
        if isinstance(exp, dict):
            new_desc = exp.get("description", "")
            # Add metrics-placeholder if not present
            if new_desc and not any(m in new_desc.lower() for m in ['increased', 'reduced', 'improved', '%', 'saved']):
                new_desc += " [Add metrics: e.g., improved efficiency by X%]"
            rewritten_exp.append(new_desc)
        elif isinstance(exp, str):
            rewritten_exp.append(exp)
    
    new_summary = f"Experienced {role} with proven ability to deliver results. Skilled in {', '.join(skills[:5]) if skills else 'technical skills'}."
    
    return {
        "name": name,
        "summary": new_summary,
        "experience": rewritten_exp,
        "skills": skills,
        "rewritten_method": "fallback"
    }


def generate_cover_letter_fallback(profile: Dict[str, Any], job_description: str, company: str, role: str) -> str:
    """Basic template-based cover letter"""
    name = profile.get("name") or "Candidate"
    summary = profile.get("summary") or "I build reliable solutions and collaborate across teams to deliver measurable outcomes."
    skills = ", ".join((profile.get("skills") or [])[:6]) or "problem solving and delivery focus"
    jd_snippet = " ".join(job_description.split()[:40]) if job_description else ""
    
    return (
        f"Dear Hiring Team at {company},\n\n"
        f"I am excited to apply for the {role} role. My name is {name}, and {summary}\n\n"
        f"My core skills include {skills}. I am particularly interested in this opportunity because it aligns with your needs: {jd_snippet}.\n\n"
        "I would welcome the chance to discuss how I can contribute quickly and responsibly to your team.\n\n"
        "Sincerely,\n"
        f"{name}"
    )


def generate_roadmap_fallback(role: str, target_skills: List[str], current_skills: List[str]) -> List[dict]:
    """Template-based roadmap"""
    missing = target_skills[:8] if target_skills else []
    
    roadmap = [
        {
            "phase": "Foundation",
            "duration": "2-3 weeks",
            "title": f"{role} Fundamentals",
            "skills": missing[:2] if missing else ["Core concepts", "Basic tools"],
            "resources": [
                {"type": "course", "title": f"{role} Basics Course"},
                {"type": "project", "title": "Simple practice project"}
            ]
        },
        {
            "phase": "Skill Building",
            "duration": "4-6 weeks",
            "title": "Practical Experience",
            "skills": missing[2:4] if len(missing) > 2 else ["Intermediate topics", "Hands-on practice"],
            "resources": [
                {"type": "course", "title": "Intermediate Level Course"},
                {"type": "project", "title": "Portfolio Project"}
            ]
        },
        {
            "phase": "Advanced & Portfolio",
            "duration": "4-6 weeks",
            "title": "Advanced Skills & Portfolio",
            "skills": missing[4:6] if len(missing) > 4 else ["Advanced topics", "Real-world application"],
            "resources": [
                {"type": "course", "title": "Advanced Course"},
                {"type": "project", "title": "Capstone Project"}
            ]
        },
        {
            "phase": "Job Ready",
            "duration": "2-3 weeks",
            "title": "Interview Preparation",
            "skills": ["Interview techniques", "Resume optimization", "Portfolio presentation"],
            "resources": [
                {"type": "practice", "title": "Mock interviews"},
                {"type": "review", "title": "Resume review"}
            ]
        }
    ]
    
    return roadmap


def recommend_projects(target_role: str, missing_skills: List[str]) -> List[Dict[str, Any]]:
    role = target_role or "General"
    skills = missing_skills[:5] if missing_skills else ["communication", "problem-solving", "execution"]
    projects = []
    for idx, skill in enumerate(skills, start=1):
        projects.append(
            {
                "title": f"{role} Portfolio Project {idx}: {skill}",
                "objective": f"Build a portfolio-grade project that demonstrates practical {skill} use.",
                "deliverables": [
                    "Architecture/design doc",
                    "Working demo with README",
                    "Metrics/results section",
                ],
                "estimated_weeks": 2 + (idx % 2),
            }
        )
    return projects


def get_translations(locale: str) -> Dict[str, str]:
    return I18N.get(locale, I18N["en"])