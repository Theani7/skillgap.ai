import json
from typing import Any, Dict, List, Tuple

from api.market_data import get_market_trends_for_role


def compute_resume_score_breakdown(resume_data: Dict[str, Any]) -> Tuple[int, List[str], Dict[str, Any]]:
    breakdown = {
        "objective_or_summary": {"weight": 15, "score": 0, "status": "missing", "evidence": []},
        "education": {"weight": 20, "score": 0, "status": "missing", "evidence": []},
        "experience": {"weight": 20, "score": 0, "status": "missing", "evidence": []},
        "skills": {"weight": 20, "score": 0, "status": "missing", "evidence": []},
        "hobbies_or_interests": {"weight": 20, "score": 0, "status": "missing", "evidence": []},
    }
    feedback_msgs: List[str] = []

    if resume_data.get("objective") or resume_data.get("summary"):
        breakdown["objective_or_summary"]["score"] = 15
        breakdown["objective_or_summary"]["status"] = "present"
        breakdown["objective_or_summary"]["evidence"] = [resume_data.get("objective") or resume_data.get("summary")]
    else:
        feedback_msgs.append("Please add your career objective, it will give your career intention to the Recruiters.")

    if resume_data.get("education") or resume_data.get("degree"):
        breakdown["education"]["score"] = 20
        breakdown["education"]["status"] = "present"
        breakdown["education"]["evidence"] = (resume_data.get("education") or [])[:2]
    else:
        feedback_msgs.append("Please add Education Details.")

    exp_evidence = resume_data.get("experience") or resume_data.get("designation") or resume_data.get("company_names")
    if exp_evidence:
        breakdown["experience"]["score"] = 20
        breakdown["experience"]["status"] = "present"
        if isinstance(exp_evidence, list):
            breakdown["experience"]["evidence"] = exp_evidence[:2]
        else:
            breakdown["experience"]["evidence"] = [str(exp_evidence)]
    else:
        feedback_msgs.append("Please add Experience Details.")

    if resume_data.get("skills"):
        breakdown["skills"]["score"] = 20
        breakdown["skills"]["status"] = "present"
        breakdown["skills"]["evidence"] = (resume_data.get("skills") or [])[:8]
    else:
        feedback_msgs.append("Please add Skills.")

    if resume_data.get("hobbies") or resume_data.get("interests"):
        breakdown["hobbies_or_interests"]["score"] = 20
        breakdown["hobbies_or_interests"]["status"] = "present"
        breakdown["hobbies_or_interests"]["evidence"] = (resume_data.get("hobbies") or resume_data.get("interests") or [])[:5]
    else:
        feedback_msgs.append("Please add Hobbies, it will show your personality.")

    total = sum(v["score"] for v in breakdown.values())
    return total, feedback_msgs, breakdown


def generate_job_matches(target_role: str, skills: List[str], missing_skills: List[str]) -> List[Dict[str, Any]]:
    role = target_role or "General"
    trends = get_market_trends_for_role(role)
    regions = trends.get("regional_distribution", [])
    top_skills = trends.get("top_skills", [])
    skill_set = {s.lower() for s in skills}
    missing_set = {s.lower() for s in missing_skills}
    matches: List[Dict[str, Any]] = []

    workplaces = ["Remote", "Hybrid", "On-site"]
    for idx, row in enumerate(top_skills[:6]):
        skill = row.get("skill", "Core Skill")
        region = regions[idx % len(regions)]["region"] if regions else "Global"
        salary = row.get("salary", 0)
        has_skill = skill.lower() in skill_set
        is_missing = skill.lower() in missing_set
        
        base_score = 70
        if has_skill:
            fit = base_score + 15
        elif is_missing:
            fit = base_score - 10
        else:
            fit = base_score + 5
            
        if salary and salary > 100000:
            fit = min(95, fit + 5)
            
        matches.append(
            {
                "job_id": f"{role[:3].upper()}-{idx+1:03d}",
                "title": f"{role} Specialist - {skill}",
                "company": f"{skill} Labs",
                "location": region,
                "workplace_type": workplaces[idx % len(workplaces)],
                "salary_estimate": salary,
                "fit_score": fit,
                "why_matched": [
                    f"Role aligns with {role}",
                    f"Market demand for {skill} is high",
                    "Score accounts for your current and missing skills",
                ],
            }
        )
    return matches


def generate_interview_questions(target_role: str, missing_skills: List[str], skills: List[str]) -> List[Dict[str, Any]]:
    role = target_role or "General"
    questions: List[Dict[str, Any]] = []
    baseline = [
        f"Walk me through your most relevant {role} project end-to-end.",
        "Describe a technical challenge where your first solution failed and how you recovered.",
        "How do you prioritize delivery speed versus quality in a team setting?",
    ]
    for idx, q in enumerate(baseline, start=1):
        questions.append({"id": idx, "question": q, "category": "behavioral"})

    start = len(questions) + 1
    focus_skills = missing_skills[:4] if missing_skills else skills[:4]
    for offset, skill in enumerate(focus_skills):
        questions.append(
            {
                "id": start + offset,
                "question": f"How would you design, implement, and validate a feature using {skill} for a {role} product?",
                "category": "technical",
                "focus_skill": skill,
            }
        )
    return questions


def rank_candidates(candidate_payloads: List[Dict[str, Any]], target_role: str) -> List[Dict[str, Any]]:
    ranked: List[Dict[str, Any]] = []
    for item in candidate_payloads:
        data = item.get("analysis_data") or item
        
        if isinstance(data, dict):
            inner_data = data.get("data", data)
        else:
            inner_data = data
            
        resume_score = float(inner_data.get("resume_score", 0) if isinstance(inner_data, dict) else 0)
        match_score = float(inner_data.get("match_score", 0) if isinstance(inner_data, dict) else 0)
        
        missing_skills = inner_data.get("missing_skills", []) if isinstance(inner_data, dict) else []
        missing_count = len(missing_skills) if isinstance(missing_skills, list) else 0
        
        final = round((resume_score * 0.5) + (match_score * 0.45) - (missing_count * 1.5), 2)
        name = inner_data.get("name") if isinstance(inner_data, dict) else item.get("name", "Unknown")
        
        ranked.append(
            {
                "candidate_id": item.get("candidate_id") or item.get("id"),
                "name": name,
                "target_role": target_role,
                "resume_score": resume_score,
                "match_score": match_score,
                "missing_skills_count": missing_count,
                "final_rank_score": max(0, min(100, final)),
            }
        )
    return sorted(ranked, key=lambda x: x["final_rank_score"], reverse=True)


def rewrite_resume_bullets_fallback(resume_data: Dict[str, Any], target_role: str) -> Dict[str, Any]:
    role = target_role or "target role"
    experience = resume_data.get("experience") or []
    rewritten = []
    
    if not experience:
        return {"target_role": role, "rewritten_bullets": []}
    
    action_verbs = ["Led", "Developed", "Implemented", "Optimized", "Streamlined"]
    for idx, line in enumerate(experience[:5]):
        bullet = str(line).strip()
        if not bullet:
            continue
        verb = action_verbs[idx % len(action_verbs)]
        rewritten.append(
            {
                "before": bullet,
                "after": f"{verb} key initiatives in {role}, driving measurable improvements through strategic planning and cross-functional collaboration.",
            }
        )
    
    if not rewritten:
        rewritten.append(
            {
                "before": "Worked on projects and responsibilities.",
                "after": f"Contributed to {role} projects with demonstrated impact on team delivery and business outcomes.",
            }
        )
    return {"target_role": role, "rewritten_bullets": rewritten}


def parse_json_safely(text: str) -> Dict[str, Any]:
    try:
        payload = json.loads(text)
        if isinstance(payload, dict):
            return payload
    except Exception:
        pass
    return {}
