import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.local_llm import get_model

logger = logging.getLogger("resume-analyzer")

router = APIRouter(prefix="/api/mock-interview", tags=["mock-interview"])


class StartInterviewRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=100)
    resume_text: Optional[str] = None


class AnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    role: str
    chat_history: list


class InterviewSession:
    def __init__(self, role: str, resume_text: Optional[str] = None):
        self.role = role
        self.resume_text = resume_text
        self.questions_asked = []
        self.answers = []
        self.current_question = None

    def to_dict(self):
        return {
            "role": self.role,
            "questions_asked": self.questions_asked,
            "answers": self.answers,
            "current_question": self.current_question,
        }


_sessions = {}


@router.post("/start")
async def start_interview(req: StartInterviewRequest):
    """Start a new interactive mock interview session."""
    import uuid
    session_id = str(uuid.uuid4())

    session = InterviewSession(role=req.role, resume_text=req.resume_text)
    _sessions[session_id] = session

    first_question = await _generate_first_question(req.role, req.resume_text)
    session.current_question = first_question

    return {
        "session_id": session_id,
        "question": first_question,
        "role": req.role,
    }


@router.post("/answer")
async def submit_answer(req: AnswerRequest):
    """Submit an answer and get feedback + next question."""
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    feedback = await _evaluate_answer(req.role, req.question, req.answer, req.chat_history)
    next_question = await _generate_followup(req.role, req.question, req.answer, req.chat_history)

    session.questions_asked.append(req.question)
    session.answers.append({"question": req.question, "answer": req.answer, "feedback": feedback})
    session.current_question = next_question

    return {
        "feedback": feedback,
        "next_question": next_question,
        "question_number": len(session.questions_asked) + 1,
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get current session state."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.to_dict()


@router.post("/finish/{session_id}")
async def finish_interview(session_id: str):
    """Finish interview and get overall evaluation."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    evaluation = await _evaluate_overall(session)
    del _sessions[session_id]
    return evaluation


async def _generate_first_question(role: str, resume_text: Optional[str]) -> str:
    model = get_model()
    resume_context = f"\nCandidate resume:\n{resume_text[:2000]}" if resume_text else ""

    prompt = f"""You are an experienced technical interviewer for a {role} position.
Generate the first interview question for this candidate.{resume_context}

Return ONLY the question text, no explanation."""

    messages = [
        {"role": "system", "content": "You are a professional technical interviewer. Ask clear, relevant questions."},
        {"role": "user", "content": prompt},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=256,
        )
        question = response["choices"][0]["message"]["content"].strip()
        return question if question else f"Tell me about your experience as a {role}."
    except Exception as e:
        logger.error(f"Failed to generate first question: {e}")
        return f"Tell me about your experience as a {role} and why you're interested in this position."


async def _evaluate_answer(role: str, question: str, answer: str, chat_history: list) -> str:
    model = get_model()
    history_str = "\n".join([f"Q: {h.get('question', '')}\nA: {h.get('answer', '')}" for h in chat_history[-4:]])

    prompt = f"""You are interviewing a candidate for a {role} position.

Previous conversation:
{history_str}

Current question: {question}
Candidate's answer: {answer}

Provide brief feedback (2-3 sentences) on their answer. Be constructive and professional. Do not repeat the question or the template instructions."""

    messages = [
        {"role": "system", "content": "You are a constructive technical interviewer providing feedback."},
        {"role": "user", "content": prompt},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.5,
            max_tokens=256,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Failed to evaluate answer: {e}")
        return "Thank you for your answer. Let me ask the next question."


async def _generate_followup(role: str, question: str, answer: str, chat_history: list) -> str:
    model = get_model()
    history_str = "\n".join([f"Q: {h.get('question', '')}\nA: {h.get('answer', '')}" for h in chat_history[-4:]])

    prompt = f"""You are interviewing a candidate for a {role} position.

Previous conversation:
{history_str}

Last question: {question}
Last answer: {answer}

Generate a relevant follow-up question. The question should:
- Probe deeper into the candidate's experience
- Be specific to their answer
- Test their technical depth

Return ONLY the question text, no explanation."""

    messages = [
        {"role": "system", "content": "You are a professional technical interviewer. Ask relevant follow-up questions."},
        {"role": "user", "content": prompt},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=256,
        )
        question = response["choices"][0]["message"]["content"].strip()
        return question if question else "Can you tell me more about that?"
    except Exception as e:
        logger.error(f"Failed to generate follow-up: {e}")
        return "Can you elaborate on that experience?"


async def _evaluate_overall(session: InterviewSession) -> dict:
    model = get_model()
    qa_summary = "\n".join([
        f"Q: {a['question']}\nA: {a['answer']}\nFeedback: {a['feedback']}"
        for a in session.answers
    ])

    prompt = f"""You interviewed a candidate for a {session.role} position.

Interview summary:
{qa_summary}

Provide an overall evaluation in this JSON format:
{{
  "score": <1-10>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "2-3 sentence overall assessment"
}}

Return ONLY the JSON, no explanation."""

    messages = [
        {"role": "system", "content": "You are an expert interviewer providing structured feedback."},
        {"role": "user", "content": prompt},
    ]

    try:
        response = model.create_chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=512,
            response_format={"type": "json_object"},
        )
        content = response["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to evaluate overall: {e}")
        return {
            "score": 5,
            "strengths": ["Participated in the interview"],
            "weaknesses": [],
            "recommendations": ["Practice more mock interviews"],
            "summary": "Thank you for completing the interview. Practice makes perfect!",
        }
