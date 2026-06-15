import json
import logging
import os
from typing import Optional

from llama_cpp import Llama

logger = logging.getLogger("resume-analyzer")

_model: Optional[Llama] = None
_model_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "llm",
    "model.gguf",
)


def get_model() -> Llama:
    """Lazy-load the Qwen2 model (singleton)."""
    global _model
    if _model is None:
        if not os.path.exists(_model_path):
            raise FileNotFoundError(f"Model not found: {_model_path}")
        logger.info(f"Loading local LLM from {_model_path}")
        _model = Llama(
            model_path=_model_path,
            n_ctx=4096,
            n_threads=4,
            verbose=False,
        )
        logger.info("Local LLM loaded successfully")
    return _model


RESUME_SYSTEM = (
    "You are an expert Technical Recruiter and Resume Parser. "
    "Extract structured data from resumes and return ONLY valid JSON."
)

RESUME_USER_TEMPLATE = """Parse the following resume text and extract structured JSON.

Target role for evaluation: {target_role}

Return ONLY valid JSON with this exact schema:
{{
  "name": "string",
  "email": "string",
  "mobile_number": "string or null",
  "skills": ["skill1", "skill2"],
  "education": ["degree - university - year"],
  "education_blocks": [{{"degree": "string", "institution": "string", "year": "string"}}],
  "experience": ["role at company: description"],
  "experience_blocks": [{{"title": "string", "company": "string", "start_date": "string", "end_date": "string", "bullets": ["bullet1"]}}],
  "company_names": ["company1"],
  "designation": ["title1"],
  "no_of_pages": 1,
  "match_score": 75,
  "missing_skills": ["skill1"],
  "roadmap": [{{"step": 1, "title": "Phase 1", "duration": "2-3 weeks", "skills": ["skill1"], "action_items": ["action1"]}}]
}}

Rules:
- Extract ALL skills mentioned in the resume
- For experience_blocks, extract title, company, dates, and bullet points
- For education_blocks, extract degree, institution, and year
- match_score: estimate 0-100 for how well the resume matches the target role
- missing_skills: skills needed for the target role but missing from the resume
- roadmap: 4-phase learning plan targeting missing skills
- Return ONLY the JSON object, no markdown, no explanation

RESUME TEXT:
{resume_text}"""


def parse_resume_with_local_llm(
    resume_text: str, target_role: str = "General"
) -> dict:
    """
    Parse resume text using the local Qwen2 model.
    Returns a dict matching the Gemini parser output shape.
    """
    try:
        model = get_model()
    except FileNotFoundError:
        logger.error("Local LLM model not found")
        return {}
    except Exception as e:
        logger.error(f"Failed to load local LLM: {e}")
        return {}

    user_msg = RESUME_USER_TEMPLATE.format(
        target_role=target_role or "General",
        resume_text=resume_text[:3500],
    )

    messages = [
        {"role": "system", "content": RESUME_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        content = response["choices"][0]["message"]["content"]
        if not content:
            logger.error("Local LLM returned empty response")
            return {}

        parsed = json.loads(content)
        if not isinstance(parsed, dict):
            logger.error("Local LLM response is not a dict")
            return {}

        parsed.setdefault("no_of_pages", 1)
        parsed.setdefault("match_score", 0)
        parsed.setdefault("missing_skills", [])
        parsed.setdefault("roadmap", [])
        parsed.setdefault("skills", [])
        parsed.setdefault("education", [])
        parsed.setdefault("experience", [])
        parsed.setdefault("education_blocks", [])
        parsed.setdefault("experience_blocks", [])
        parsed.setdefault("company_names", [])
        parsed.setdefault("designation", [])

        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"Local LLM returned invalid JSON: {e}")
        return {}
    except Exception as e:
        logger.error(f"Local LLM parsing failed: {e}")
        return {}


ROADMAP_SYSTEM = (
    "You are an expert Career Coach and Learning Architect. "
    "Generate specific, actionable learning steps for tech skills."
)

ROADMAP_USER_TEMPLATE = """For a {target_role} role, generate specific action items for learning these skills:
{missing_skills}

Current skills: {current_skills}

Return ONLY valid JSON:
{{
  "actions": {{
    "skill_name": ["action1", "action2", "action3"],
    "skill_name2": ["action1", "action2"]
  }}
}}

Rules:
- Each skill gets 2-3 specific, actionable items
- Actions must be concrete (e.g., "Build a REST API with Express.js and PostgreSQL")
- NOT generic (e.g., "Learn Express.js")
- Return ONLY the JSON, no explanation"""


def generate_roadmap_with_llm(
    target_role: str,
    current_skills: list[str],
    missing_skills: list[str],
) -> dict:
    """
    Generate skill-specific action items using the local Qwen2 model.
    Returns a dict mapping skill names to action item lists.
    """
    try:
        model = get_model()
    except FileNotFoundError:
        logger.error("Local LLM model not found")
        return {}
    except Exception as e:
        logger.error(f"Failed to load local LLM: {e}")
        return {}

    user_msg = ROADMAP_USER_TEMPLATE.format(
        target_role=target_role or "Professional",
        current_skills=", ".join(current_skills[:10]) if current_skills else "none",
        missing_skills=", ".join(missing_skills[:8]) if missing_skills else "none",
    )

    messages = [
        {"role": "system", "content": ROADMAP_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        content = response["choices"][0]["message"]["content"]
        if not content:
            logger.error("Local LLM actions returned empty response")
            return {}

        parsed = json.loads(content)
        if not isinstance(parsed, dict) or "actions" not in parsed:
            logger.error("Local LLM actions response missing 'actions' key")
            return {}

        actions = parsed["actions"]
        if not isinstance(actions, dict):
            return {}

        # Clean and validate
        cleaned = {}
        for skill, items in actions.items():
            if isinstance(items, list) and items:
                cleaned[skill.lower()] = [str(i) for i in items[:3]]

        return cleaned

    except json.JSONDecodeError as e:
        logger.error(f"Local LLM actions returned invalid JSON: {e}")
        return {}
    except Exception as e:
        logger.error(f"Local LLM actions generation failed: {e}")
        return {}
