import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PyPDF2 import PdfReader
import docx
import json
import logging

logger = logging.getLogger("resume-analyzer")
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    logger.error("GEMINI_API_KEY is not set in environment variables")
    raise ValueError("GEMINI_API_KEY environment variable is required")

client = genai.Client(api_key=api_key)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a PDF file."""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(docx_path: str) -> str:
    """Extracts raw text from a DOCX file."""
    try:
        doc = docx.Document(docx_path)
        text = ""
        for para in doc.paragraphs:
            if para.text:
                text += para.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""

def parse_resume_with_gemini(file_path: str, target_role: str = None) -> dict:
    """
    Reads a PDF or DOCX, sends the text to Gemini, and extracts structured JSON containing
    the candidate's profile, education, experience, and skills.
    """
    if file_path.lower().endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        raw_text = extract_text_from_docx(file_path)
    else:
        return {}
    
    if not raw_text.strip():
        return {}
        
    role_instruction = f"The candidate is applying for the target role of: '{target_role}'." if target_role else ""

    prompt = f"""
    You are an expert Technical Recruiter, AI Parser, and Career Coach.
    Carefully read the following resume text and extract the information into the EXACT JSON structure defined below.
    If a field is missing from the resume, return null or an empty array/string as appropriate.
    DO NOT return Markdown formatting. Return ONLY valid JSON.
    
    {role_instruction}
    If a target role is provided, you MUST evaluate the candidate's skills against standard industry requirements for that role.
    Determine what crucial skills the candidate is missing for that role, and return them as an array of strings in 'missing_skills'.
    Estimate how well the candidate's qualifications match the target role as an integer percentage (0-100) in 'match_score'. If no target role is explicitly provided, evaluate them based on their most prominent apparent field.

    CRITICAL NEW INSTRUCTION - ROADMAP:
    Generate a highly personalized, 4-phase chronological learning path aimed at helping the user master their 'missing_skills' and secure the target role (or next logical career step). 
    Return this in the 'roadmap' array. Each phase must include specific 'action_items'. Make the advice practical and actionable.

    RESUME TEXT:
    {raw_text}
    """

    # We enforce a strict JSON schema so that we can reliably parse the output
    # in our main application, perfectly replacing the old pyresparser dictionary.
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "name": {"type": "STRING"},
            "email": {"type": "STRING"},
            "mobile_number": {"type": "STRING"},
            "skills": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "A comprehensive list of all technical and soft skills."
            },
            "education": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "List of degrees, universities, and graduation years."
            },
            "experience": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "List of roles, companies, and descriptions."
            },
            "company_names": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "List of companies the person has worked for."
            },
            "designation": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "List of job titles the person has held."
            },
            "missing_skills": {
                "type": "ARRAY",
                "items": {"type": "STRING"},
                "description": "Prioritized list of crucial skills the candidate lacks for the target role."
            },
            "match_score": {
                "type": "INTEGER",
                "description": "Percentage representing alignment with target role."
            },
            "no_of_pages": {"type": "INTEGER", "description": "Estimate 1 if unknown."},
            "roadmap": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "step": {"type": "INTEGER", "description": "Phase number (1-4)"},
                        "title": {"type": "STRING", "description": "Title of the phase"},
                        "duration": {"type": "STRING", "description": "Estimated duration (e.g., '3-4 weeks')"},
                        "skills": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                            "description": "Skills focused on in this phase"
                        },
                        "action_items": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                            "description": "Specific, actionable steps to master the skills in this phase"
                        }
                    },
                    "required": ["step", "title", "duration", "skills", "action_items"]
                },
                "description": "A 4-phase personalized chronological learning path."
            }
        },
        "required": ["name", "email", "skills", "education", "experience", "roadmap"]
    }

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.1,
            ),
        )
        
        if not response or not response.text:
            logger.error("Gemini returned empty response")
            return {}
        
        parsed_data = json.loads(response.text)
        
        if not isinstance(parsed_data, dict):
            logger.error("Gemini response is not a valid JSON object")
            return {}
        
        try:
            if file_path.lower().endswith('.pdf'):
                reader = PdfReader(file_path)
                parsed_data["no_of_pages"] = len(reader.pages)
            else:
                parsed_data["no_of_pages"] = 1
        except Exception as page_error:
            logger.warning(f"Could not determine page count: {page_error}")
            parsed_data["no_of_pages"] = 1
            
        return parsed_data

    except json.JSONDecodeError as json_err:
        logger.error(f"Failed to parse Gemini JSON response: {json_err}")
        return {}
    except Exception as e:
        logger.error(f"Error during Gemini extraction: {e}")
        return {}


def rewrite_resume_with_gemini(resume_data: dict, target_role: str = None) -> dict:
    role = target_role or "Target Role"
    prompt = f"""
    You are an expert resume editor.
    Rewrite resume experience bullets for the role: {role}.
    Return JSON only with this schema:
    {{
      "target_role": "string",
      "rewritten_bullets": [
        {{"before": "string", "after": "string"}}
      ]
    }}
    Use action verbs and quantified outcomes where possible.
    Input resume JSON:
    {json.dumps(resume_data)}
    """
    response_schema = {
        "type": "OBJECT",
        "properties": {
            "target_role": {"type": "STRING"},
            "rewritten_bullets": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "before": {"type": "STRING"},
                        "after": {"type": "STRING"}
                    },
                    "required": ["before", "after"]
                }
            }
        },
        "required": ["target_role", "rewritten_bullets"]
    }
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.2,
            ),
        )
        if not response or not response.text:
            logger.error("Gemini returned empty response for resume rewrite")
            return {}
        return json.loads(response.text)
    except json.JSONDecodeError as json_err:
        logger.error(f"Failed to parse Gemini resume rewrite response: {json_err}")
        return {}
    except Exception as e:
        logger.error(f"Error during Gemini resume rewrite: {e}")
        return {}


def generate_cover_letter_with_gemini(profile: dict, job_description: str, company: str, role: str) -> str:
    prompt = f"""
    You are an expert career coach. Generate a concise professional cover letter.
    Company: {company}
    Role: {role}
    Candidate profile JSON: {json.dumps(profile)}
    Job description: {job_description}
    Constraints:
    - 220-320 words
    - Executive professional tone
    - Mention measurable impact
    - No markdown
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
            ),
        )
        if not response or not response.text:
            logger.error("Gemini returned empty response for cover letter generation")
            return ""
        return (response.text or "").strip()
    except Exception as e:
        logger.error(f"Error during Gemini cover letter generation: {e}")
        return ""
