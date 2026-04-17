import copy
import json
import os
import time
from typing import Any, Dict, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from dotenv import load_dotenv

from api.database import get_db_connection
from api.trends import INDUSTRY_TRENDS

load_dotenv()


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
    static_trends = copy.deepcopy(INDUSTRY_TRENDS.get(mapped_role, INDUSTRY_TRENDS["General"]))

    provider = os.getenv("MARKET_DATA_PROVIDER", "static").strip().lower()
    api_key = os.getenv("THEIRSTACK_API_KEY", "").strip()

    if provider != "theirstack" or not api_key:
        return static_trends

    cache_ttl = _safe_int(os.getenv("THEIRSTACK_CACHE_TTL_SECONDS", "21600"), 21600)
    cached_payload = _get_cached_trends(mapped_role, cache_ttl)
    if cached_payload:
        return cached_payload

    raw_payload = _fetch_theirstack_market_payload(mapped_role, api_key)
    if not raw_payload:
        return static_trends

    merged_payload = _merge_trend_payload(static_trends, _transform_theirstack_payload(raw_payload))
    _set_cached_trends(mapped_role, "theirstack", merged_payload)
    return merged_payload


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


def _safe_int(raw: str, fallback: int) -> int:
    try:
        return int(raw)
    except (TypeError, ValueError):
        return fallback


def _get_cached_trends(role: str, ttl_seconds: int) -> Optional[Dict[str, Any]]:
    now_ts = int(time.time())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT payload, fetched_at FROM market_trends_cache WHERE field = ? AND source = ?",
        (role, "theirstack"),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    if row["fetched_at"] + ttl_seconds < now_ts:
        return None
    try:
        return json.loads(row["payload"])
    except (TypeError, json.JSONDecodeError):
        return None


def _set_cached_trends(role: str, source: str, payload: Dict[str, Any]) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO market_trends_cache(field, source, payload, fetched_at)
        VALUES(?, ?, ?, ?)
        ON CONFLICT(field) DO UPDATE SET
            source = excluded.source,
            payload = excluded.payload,
            fetched_at = excluded.fetched_at
        """,
        (role, source, json.dumps(payload), int(time.time())),
    )
    conn.commit()
    conn.close()


def _fetch_theirstack_market_payload(role: str, api_key: str) -> Optional[Dict[str, Any]]:
    base_url = os.getenv("THEIRSTACK_BASE_URL", "https://api.theirstack.com/v1").rstrip("/")
    endpoint = os.getenv("THEIRSTACK_TRENDS_ENDPOINT", "/market/trends")
    timeout_seconds = _safe_int(os.getenv("THEIRSTACK_TIMEOUT_SECONDS", "15"), 15)

    query = {
        "role": role,
        "limit": os.getenv("THEIRSTACK_RESULT_LIMIT", "5"),
    }
    url = f"{base_url}{endpoint}?{urlencode(query)}"

    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_key}",
        "X-API-Key": api_key,
    }

    try:
        req = Request(url=url, headers=headers, method="GET")
        with urlopen(req, timeout=timeout_seconds) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            if isinstance(data, dict):
                return data
            return None
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return None


def _merge_trend_payload(static_payload: Dict[str, Any], live_payload: Dict[str, Any]) -> Dict[str, Any]:
    merged = copy.deepcopy(static_payload)
    for key in ["growth", "top_skills", "remote_vs_onsite", "regional_distribution"]:
        if live_payload.get(key):
            merged[key] = live_payload[key]
    return merged


def _transform_theirstack_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    transformed = {
        "growth": _parse_growth(payload),
        "top_skills": _parse_top_skills(payload),
        "remote_vs_onsite": _parse_remote_split(payload),
        "regional_distribution": _parse_regions(payload),
    }
    return transformed


def _parse_growth(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    candidates = (
        payload.get("growth")
        or payload.get("job_demand_projection")
        or payload.get("demand_history")
        or []
    )
    result: List[Dict[str, Any]] = []
    for item in candidates:
        if not isinstance(item, dict):
            continue
        label = (
            item.get("year")
            or item.get("date")
            or item.get("month")
            or item.get("period")
        )
        demand = item.get("demand") or item.get("count") or item.get("index")
        if label is None or demand is None:
            continue
        try:
            result.append({"year": str(label), "demand": int(float(demand))})
        except (TypeError, ValueError):
            continue
    return result[:8]


def _parse_top_skills(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    candidates = payload.get("top_skills") or payload.get("skills") or []
    result: List[Dict[str, Any]] = []
    for item in candidates:
        if not isinstance(item, dict):
            continue
        skill = item.get("skill") or item.get("name")
        salary = item.get("salary") or item.get("avg_salary") or item.get("median_salary")
        if not skill or salary is None:
            continue
        try:
            result.append({"skill": str(skill), "salary": int(float(salary))})
        except (TypeError, ValueError):
            continue
    return result[:8]


def _parse_remote_split(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    direct = payload.get("remote_vs_onsite") or payload.get("workplace_split")
    if isinstance(direct, list):
        return _normalize_split_rows(direct)

    types = payload.get("workplace_types") or {}
    if isinstance(types, dict):
        items = [{"name": k, "value": v} for k, v in types.items()]
        return _normalize_split_rows(items)
    return []


def _normalize_split_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    parsed: List[Dict[str, Any]] = []
    total = 0.0
    for row in rows:
        if not isinstance(row, dict):
            continue
        name = row.get("name") or row.get("type") or row.get("workplace_type")
        raw_value = row.get("value") or row.get("count") or row.get("percentage")
        if not name or raw_value is None:
            continue
        try:
            value = float(raw_value)
        except (TypeError, ValueError):
            continue
        if value < 0:
            continue
        parsed.append({"name": str(name).title(), "value": value})
        total += value

    if not parsed:
        return []
    if total <= 0:
        return []
    return [
        {"name": row["name"], "value": int(round((row["value"] / total) * 100))}
        for row in parsed
    ]


def _parse_regions(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    candidates = (
        payload.get("regional_distribution")
        or payload.get("locations")
        or payload.get("top_regions")
        or []
    )
    result: List[Dict[str, Any]] = []
    for item in candidates:
        if not isinstance(item, dict):
            continue
        region = item.get("region") or item.get("city") or item.get("location")
        salary = item.get("salary") or item.get("avg_salary") or item.get("median_salary")
        if not region or salary is None:
            continue
        try:
            result.append({"region": str(region), "salary": int(float(salary))})
        except (TypeError, ValueError):
            continue
    return result[:8]
