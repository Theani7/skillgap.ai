from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter(prefix="/api/mock-interview", tags=["mock-interview"])

QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "data", "mock_questions.json")


def _load_questions():
    with open(QUESTIONS_FILE, "r") as f:
        return json.load(f)


@router.get("/{role}")
async def get_mock_questions(role: str):
    data = _load_questions()
    normalized = role.strip().lower()
    for key in data.get("roles", {}):
        if key.lower() == normalized:
            return {"role": key, "questions": data["roles"][key]}
    raise HTTPException(status_code=404, detail=f"No questions found for role: {role}")


@router.get("")
async def list_roles():
    data = _load_questions()
    return {"roles": list(data.get("roles", {}).keys())}
