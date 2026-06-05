import copy
from typing import Any, Dict, Optional

from api.trends import INDUSTRY_TRENDS

ROLE_ALIASES = {
    "ios development": "IOS Development",
    "iOS development": "IOS Development",
    "ui ux development": "UI-UX Development",
    "ui/ux development": "UI-UX Development",
    "web developer": "Web Development",
    "data scientist": "Data Science",
}


def get_market_trends_for_role(role: Optional[str]) -> Dict[str, Any]:
    mapped_role = _normalize_role(role)
    return copy.deepcopy(INDUSTRY_TRENDS.get(mapped_role, INDUSTRY_TRENDS["General"]))


def _normalize_role(role: Optional[str]) -> str:
    if not role or role == "Unknown":
        return "General"
    cleaned = role.strip()
    if cleaned in INDUSTRY_TRENDS:
        return cleaned
    alias = ROLE_ALIASES.get(cleaned.lower())
    if alias:
        return alias
    return "General"
