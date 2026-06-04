from fastapi import HTTPException, status

class SkillGapException(Exception):
    """Base class for all SkillGap specific exceptions."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)

class ResumeParseException(SkillGapException):
    def __init__(self, message: str = "Failed to parse resume content"):
        super().__init__(message, code="RESUME_PARSE_FAILED", status_code=422)

class LLMServiceException(SkillGapException):
    def __init__(self, message: str = "AI service is temporarily unavailable"):
        super().__init__(message, code="AI_SERVICE_ERROR", status_code=503)

class DatabaseContentionException(SkillGapException):
    def __init__(self, message: str = "Database is busy, please try again"):
        super().__init__(message, code="DB_BUSY", status_code=503)

class AuthenticationException(SkillGapException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, code="AUTH_FAILED", status_code=401)
