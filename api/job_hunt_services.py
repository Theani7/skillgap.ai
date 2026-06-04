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

from api.skills_taxonomy import ALL_SKILLS, SKILLS_TAXONOMY

def fuzzy_skill_match(text: str, skill: str) -> bool:
    """Check for skill with word boundaries and common variations."""
    pattern = rf'\b{re.escape(skill)}\b'
    if re.search(pattern, text, re.IGNORECASE):
        return True
    # Handle common abbreviations or variations (e.g. 'JS' for 'Javascript')
    variations = {
        "javascript": ["js"],
        "typescript": ["ts"],
        "kubernetes": ["k8s"],
        "amazon web services": ["aws"],
        "google cloud platform": ["gcp"],
        "ci/cd": ["cicd", "continuous integration"],
        "machine learning": ["ml"],
        "natural language processing": ["nlp"]
    }
    for variant in variations.get(skill.lower(), []):
        if re.search(rf'\b{re.escape(variant)}\b', text, re.IGNORECASE):
            return True
    return False

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

def parse_resume_fallback(text: str, target_role: str = None) -> dict:
    """
    Improved Hybrid Resume Parser
    Uses section detection, comprehensive taxonomy, and confidence scoring.
    """
    text_lower = text.lower()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # 1. Section Identification
    sections = {
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "summary": ""
    }
    
    current_section = None
    section_headers = {
        "experience": ["experience", "work history", "employment", "professional background"],
        "education": ["education", "academic", "qualifications", "university"],
        "skills": ["skills", "technical stack", "competencies", "technologies"],
        "projects": ["projects", "personal projects", "portfolio"],
        "summary": ["summary", "profile", "objective", "about me"]
    }

    for line in lines:
        line_clean = line.lower().strip(':')
        header_found = False
        for sec, headers in section_headers.items():
            if line_clean in headers or any(h in line_clean and len(line_clean) < 20 for h in headers):
                current_section = sec
                header_found = True
                break
        
        if header_found: continue
        
        if current_section == "summary":
            sections["summary"] += line + " "
        elif current_section:
            sections[current_section].append(line)

    # 2. Entity Extraction
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', text)
    phone_match = re.search(r'[\+]?[\d\s\-\(\)]{10,}', text)
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text_lower)
    github_match = re.search(r'github\.com/[\w-]+', text_lower)
    
    # 3. Skill Extraction (Taxonomy + Contextual + Fuzzy)
    found_skills = set()
    for skill in ALL_SKILLS:
        if fuzzy_skill_match(text_lower, skill):
            found_skills.add(skill.title())
            
    # 4. Name Detection (Heuristic: First prominent line not containing common noise)
    name = "Unknown"
    noise = ["resume", "curriculum", "vitae", "profile", "@", "http", "phone", "email"]
    for line in lines[:5]:
        if not any(n in line.lower() for n in noise) and len(line.split()) <= 4:
            name = line
            break

    # 5. Missing Skills Logic (Local)
    target_skills = SKILLS_TAXONOMY.get("Other Technical", [])
    for cat, skills in SKILLS_TAXONOMY.items():
        if target_role and any(s in target_role.lower() for s in cat.lower().split()):
            target_skills = skills
            break
    
    missing_skills = [s for s in target_skills if s.title() not in found_skills]

    # 6. Confidence Scoring
    confidence = 0
    if name != "Unknown": confidence += 20
    if email_match: confidence += 20
    if len(found_skills) > 5: confidence += 30
    if sections["experience"]: confidence += 15
    if sections["education"]: confidence += 15

    return {
        "name": name,
        "email": email_match.group(0) if email_match else "",
        "mobile_number": phone_match.group(0) if phone_match else "",
        "skills": list(found_skills),
        "education": sections["education"][:5],
        "experience": sections["experience"][:10],
        "designation": [], 
        "missing_skills": missing_skills[:5],
        "match_score": 70 if found_skills else 0, # Static local estimate
        "roadmap": generate_synthetic_roadmap(target_role, list(found_skills)),
        "links": {
            "linkedin": f"https://{linkedin_match.group(0)}" if linkedin_match else "",
            "github": f"https://{github_match.group(0)}" if github_match else ""
        },
        "summary": sections["summary"].strip(),
        "no_of_pages": 1,
        "confidence_score": confidence,
        "parsing_method": "local_hybrid_v2"
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