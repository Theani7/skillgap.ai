import bcrypt
import logging

logger = logging.getLogger("resume-analyzer")


def _truncate_for_bcrypt(password: str) -> bytes:
    if isinstance(password, str):
        password_bytes = password.encode('utf-8')
    else:
        password_bytes = password
    if len(password_bytes) > 72:
        logger.warning(
            "Password exceeds 72 bytes (%d bytes). "
            "Only the first 72 bytes will be used for hashing.",
            len(password_bytes)
        )
    return password_bytes[:72]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(_truncate_for_bcrypt(plain_password), hashed_password.encode('utf-8'))
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_truncate_for_bcrypt(password), bcrypt.gensalt(rounds=12)).decode('utf-8')
