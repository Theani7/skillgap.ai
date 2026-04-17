from typing import Any, Dict, List
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

def parse_resume_fallback(text: str, target_role: str = None) -> dict:
    """Fallback resume parser using regex/keyword extraction"""
    text_lower = text.lower()
    
    # Extract skills by common patterns
    skill_patterns = [
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node', 'django', 'flask',
        'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
        'html', 'css', 'git', 'linux', 'bash', 'rest', 'graphql', 'api', 'agile', 'scrum',
        'machine learning', 'data analysis', 'analytics', 'tableau', 'power bi', 'excel',
        'project management', 'communication', 'leadership', 'teamwork',
        'c', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
        'selenium', 'jenkins', 'ci/cd', 'jira',
    ]
    
    found_skills = [s for s in skill_patterns if s in text_lower]
    
    # Extract email
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', text)
    email = email_match.group(0) if email_match else ""
    
    # Extract phone
    phone_match = re.search(r'[\+]?[\d\s\-\(\)]{10,}', text)
    phone = phone_match.group(0) if phone_match else ""
    
    # Extract name (usually at the top, first line with caps)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    name = lines[0] if lines else "Unknown"
    
    # Extract links
    linkedin_match = re.search(r'linkedin\.com/[\w-]+', text_lower)
    github_match = re.search(r'github\.com/[\w-]+', text_lower)
    portfolio_match = re.search(r'(portfolio|website|personal site)[:\s]*([\w.-]+)', text_lower)
    
    links = {}
    if linkedin_match: links['linkedin'] = f"https://{linkedin_match.group(0)}"
    if github_match: links['github'] = f"https://{github_match.group(0)}"
    if portfolio_match: links['portfolio'] = portfolio_match.group(2)
    
    # Extract designation/job titles
    title_patterns = [
        r'software engineer', r'data scientist', r'data analyst', r'web developer',
        r'full stack', r'frontend', r'backend', r'mobile developer', r'devops',
        r'project manager', r'product manager', r'business analyst', r'qa engineer',
    ]
    designations = []
    for pattern in title_patterns:
        if re.search(pattern, text_lower):
            designations.append(pattern.title().replace('Qa ', 'QA '))
    
    # Extract education
    education = []
    edu_patterns = [
        (r'bachelor[\s\w]+ (\w+)', 'Bachelor'),
        (r'master[\s\w]+ (\w+)', 'Master'),
        (r'phd', 'PhD'),
        (r'degree', ''),
    ]
    for pattern, degree in edu_patterns:
        match = re.search(pattern, text_lower)
        if match:
            education.append(f"{degree} in {match.group(1) if match.lastindex else 'Related Field'}")
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": found_skills[:15],
        "designation": designations[:5],
        "summary": "",
        "experience": [],
        "education": education[:5],
        "links": links,
        "parsing_method": "fallback"
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