import json
import logging
import os
from typing import Optional

from llama_cpp import Llama

logger = logging.getLogger("resume-analyzer")

_model: Optional[Llama] = None
MODEL_PATH = os.getenv(
    "LOCAL_LLM_MODEL_PATH",
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "llm",
        "qwen2-0_5b-instruct-q4_k_m.gguf",
    ),
)

DEFAULT_RESUME = {
    "name": None, "email": None, "mobile_number": None,
    "skills": [], "education": [], "education_blocks": [],
    "experience": [], "experience_blocks": [],
    "company_names": [], "designation": [],
    "no_of_pages": 1, "match_score": 0,
    "missing_skills": [], "roadmap": [],
}


def get_model() -> Llama:
    """Lazy-load the Qwen2-0.5B-Instruct model (singleton)."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        logger.info(f"Loading Qwen2-0.5B-Instruct from {MODEL_PATH}")
        _model = Llama(
            model_path=MODEL_PATH,
            n_ctx=4096,
            n_threads=4,
            verbose=False,
        )
        logger.info("Local LLM loaded successfully")
    return _model


def _repair_json(raw: str) -> Optional[dict]:
    """Attempt to repair truncated or malformed JSON from the model."""
    if not raw or not raw.strip():
        return None

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    # Find last complete top-level object by tracking brace depth
    depth = 0
    last_valid_end = -1
    in_string = False
    escape = False

    for i, ch in enumerate(cleaned):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                last_valid_end = i

    if last_valid_end > 0:
        try:
            parsed = json.loads(cleaned[:last_valid_end + 1])
            if isinstance(parsed, dict):
                logger.warning("Repaired truncated JSON response")
                return parsed
        except json.JSONDecodeError:
            pass

    # Try closing unclosed structures
    if depth > 0 and not in_string:
        open_brackets = cleaned.count('[') - cleaned.count(']')
        open_braces = cleaned.count('{') - cleaned.count('}')
        closing = ']' * open_brackets + '}' * open_braces

        for suffix in [closing, '"' + closing, '",' + closing]:
            try:
                parsed = json.loads(cleaned + suffix)
                if isinstance(parsed, dict):
                    logger.warning("Repaired truncated JSON by closing structures")
                    return parsed
            except json.JSONDecodeError:
                continue

    return None


def _recombine_split_items(items: list) -> list:
    """Recombine array items that were split by commas into proper entries."""
    if not items:
        return []

    recombined = []
    current = ""

    for item in items:
        item = str(item).strip()
        if not item:
            continue

        # If current item looks like a year or standalone degree, append to previous
        if current and (item.isdigit() or len(item) <= 4):
            current = f"{current}, {item}"
        elif current and not any(c in item for c in ["@", "http"]) and len(item.split()) <= 3:
            # Short string that's likely a continuation (e.g., "MIT", "2018")
            current = f"{current}, {item}"
        else:
            if current:
                recombined.append(current)
            current = item

    if current:
        recombined.append(current)

    return recombined


def _build_blocks(flat_items: list, block_type: str) -> list:
    """Build structured blocks from flat string arrays."""
    blocks = []
    if block_type == "education":
        for item in flat_items[:5]:
            if not isinstance(item, str):
                continue
            parts = [p.strip() for p in item.replace(" - ", "|").replace(",", "|").split("|") if p.strip()]
            if len(parts) >= 3:
                blocks.append({"degree": parts[0], "institution": parts[1], "year": parts[2]})
            elif len(parts) == 2:
                blocks.append({"degree": parts[0], "institution": parts[1], "year": ""})
            elif len(parts) == 1:
                blocks.append({"degree": parts[0], "institution": "", "year": ""})
    elif block_type == "experience":
        for item in flat_items[:5]:
            if not isinstance(item, str):
                continue
            title = item.split(" at ")[0].strip() if " at " in item else item.split(",")[0].strip()
            company = item.split(" at ")[1].split(",")[0].strip() if " at " in item else ""
            blocks.append({
                "title": title,
                "company": company,
                "start_date": "",
                "end_date": "",
                "bullets": [],
            })
    return blocks


def _build_roadmap(missing_skills: list, target_role: str) -> list:
    """Generate a basic 4-phase roadmap from missing skills."""
    if not missing_skills:
        return []
    chunk_size = max(1, len(missing_skills) // 4)
    phases = []
    for i in range(4):
        start = i * chunk_size
        end = start + chunk_size if i < 3 else len(missing_skills)
        chunk = missing_skills[start:end]
        if not chunk:
            continue
        phases.append({
            "step": i + 1,
            "title": f"Phase {i + 1}: Learn {', '.join(chunk[:3])}",
            "duration": f"{2 + i} weeks",
            "skills": chunk,
            "action_items": [f"Practice {s} with hands-on projects" for s in chunk[:3]],
        })
    return phases


def _normalize_response(raw: dict) -> dict:
    """Normalize model output to match expected schema."""
    result = dict(DEFAULT_RESUME)

    # Extract flat fields
    for key in ("name", "email", "mobile_number"):
        val = raw.get(key)
        result[key] = str(val) if val and val != "null" else None

    for key in ("no_of_pages", "match_score"):
        try:
            result[key] = int(raw.get(key, 0))
        except (ValueError, TypeError):
            pass

    for key in ("skills", "education", "experience", "company_names", "designation", "missing_skills"):
        val = raw.get(key, [])
        if isinstance(val, list):
            result[key] = [str(x) for x in val if x][:15]

    # Recombine split education and experience entries
    result["education"] = _recombine_split_items(result["education"])
    result["experience"] = _recombine_split_items(result["experience"])

    # Build blocks from flat arrays
    if not raw.get("education_blocks"):
        result["education_blocks"] = _build_blocks(result["education"], "education")
    else:
        result["education_blocks"] = raw["education_blocks"][:5]

    if not raw.get("experience_blocks"):
        result["experience_blocks"] = _build_blocks(result["experience"], "experience")
    else:
        result["experience_blocks"] = raw["experience_blocks"][:5]

    # Build roadmap
    if raw.get("roadmap"):
        result["roadmap"] = raw["roadmap"][:4]
    else:
        result["roadmap"] = _build_roadmap(result["missing_skills"], result.get("name", ""))

    return result


RESUME_SYSTEM = (
    "You are a resume parser. Extract the actual data from the resume text. "
    "Never use placeholder text. Always return real extracted values. "
    "Each education entry must be a single short string like 'BS Computer Science, MIT, 2018'. "
    "Each experience entry must be a single short string like 'Developer at Google, 2020-Present'."
)

RESUME_USER_TEMPLATE = """Parse this resume and extract the actual information into JSON.

Rules:
- name: person's full name
- email: their email address
- mobile_number: phone number or null
- skills: array of skill names like ["Python","JavaScript"]
- education: array of short strings like ["BS Computer Science, MIT, 2018"]
- experience: array of short strings like ["Developer at Google, 2020-Present"]
- company_names: array of company names
- designation: array of job titles
- no_of_pages: 1
- match_score: 0-100 fit for target role
- missing_skills: skills needed for target role not in resume

Target role: {target_role}

Now parse this resume and return ONLY the JSON:
{resume_text}"""


def parse_resume_with_local_llm(
    resume_text: str, target_role: str = "General"
) -> dict:
    """Parse resume text using the local SmolLM-360M model."""
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
        resume_text=resume_text[:2500],
    )

    messages = [
        {"role": "system", "content": RESUME_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.1,
            max_tokens=512,
            response_format={"type": "json_object"},
        )

        content = response["choices"][0]["message"]["content"]
        if not content:
            logger.error("Local LLM returned empty response")
            return {}

        parsed = _repair_json(content)
        if parsed is None:
            logger.error("Local LLM returned invalid JSON")
            return {}

        return _normalize_response(parsed)

    except Exception as e:
        logger.error(f"Local LLM parsing failed: {e}")
        return {}


ROADMAP_SYSTEM = "You are a career coach. Return ONLY valid JSON."

ROADMAP_USER_TEMPLATE = """Generate 2-3 learning actions per skill for {target_role}.
Skills: {missing_skills}

Return ONLY JSON:
{{"actions":{{"skill":["action1","action2"]}}}}"""


def generate_roadmap_with_llm(
    target_role: str,
    current_skills: list[str],
    missing_skills: list[str],
) -> dict:
    """Generate skill-specific action items using the local SmolLM-360M model."""
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
        missing_skills=", ".join(missing_skills[:6]) if missing_skills else "none",
    )

    messages = [
        {"role": "system", "content": ROADMAP_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=512,
            response_format={"type": "json_object"},
        )

        content = response["choices"][0]["message"]["content"]
        if not content:
            return {}

        parsed = _repair_json(content)
        if parsed is None or "actions" not in parsed:
            return {}

        actions = parsed["actions"]
        if not isinstance(actions, dict):
            return {}

        cleaned = {}
        for skill, items in actions.items():
            if isinstance(items, list) and items:
                cleaned[skill.lower()] = [str(i) for i in items[:3]]

        return cleaned

    except Exception as e:
        logger.error(f"Local LLM actions generation failed: {e}")
        return {}


def test_load() -> bool:
    """Quick sanity check: loads the model and runs a trivial prompt."""
    try:
        model = get_model()
        resp = model.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Answer yes or no."},
            ],
            max_tokens=2,
            temperature=0.0,
        )
        answer = resp["choices"][0]["message"]["content"]
        logger.info(f"Qwen2-0.5B test response: {answer!r}")
        return True
    except Exception as e:
        logger.error(f"Qwen2-0.5B test failed: {e}")
        return False
