"""Parol xeshlash (Argon2) va JWT tokenlar."""
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import get_settings

_hasher = PasswordHasher()  # argon2id, xavfsiz standart parametrlar


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(user_id: int, expires_minutes: int | None = None) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    minutes = expires_minutes if expires_minutes is not None else settings.access_token_expire_minutes
    payload = {"sub": str(user_id), "type": "access", "iat": now, "exp": now + timedelta(minutes=minutes)}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """Token to'g'ri bo'lsa — foydalanuvchi ID, aks holda None."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None
    if payload.get("type") != "access":
        return None
    try:
        return int(payload["sub"])
    except (TypeError, ValueError):
        return None
