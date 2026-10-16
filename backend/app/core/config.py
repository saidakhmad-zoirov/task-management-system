"""
Ilova sozlamalari. Hammasi .env faylidan (yoki muhit o'zgaruvchilaridan) o'qiladi.
Namuna: backend/.env.example
"""
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field, field_validator

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


class Settings(BaseModel):
    app_name: str = "TaskPulse"
    database_url: str
    secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=60, ge=5, le=60 * 24 * 7)
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Sozlamalar bir marta o'qiladi va keshlanadi."""
    secret = os.getenv("SECRET_KEY", "")
    if not secret:
        raise RuntimeError("SECRET_KEY .env faylida ko'rsatilmagan (README ga qarang).")
    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError("DATABASE_URL .env faylida ko'rsatilmagan (README ga qarang).")
    data = {
        "database_url": database_url,
        "secret_key": secret,
        "access_token_expire_minutes": os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"),
    }
    if os.getenv("CORS_ORIGINS"):
        data["cors_origins"] = os.getenv("CORS_ORIGINS")
    return Settings(**data)
