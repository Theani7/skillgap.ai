import bcrypt


def _truncate_for_bcrypt(password: str) -> bytes:
    if isinstance(password, str):
        password = password.encode('utf-8')
    return password[:72]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(_truncate_for_bcrypt(plain_password), hashed_password.encode('utf-8'))
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_truncate_for_bcrypt(password), bcrypt.gensalt(rounds=12)).decode('utf-8')
