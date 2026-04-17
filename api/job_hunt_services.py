from typing import Any, Dict, List


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


def generate_cover_letter_fallback(profile: Dict[str, Any], job_description: str, company: str, role: str) -> str:
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
