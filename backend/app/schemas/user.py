import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

USERNAME_RE = re.compile(r"^[A-Za-z0-9_.]{3,50}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")


def check_username(value: str) -> str:
    value = value.strip()
    if not USERNAME_RE.match(value):
        raise ValueError("Username 3–50 belgi: lotin harflari, raqam, '_' yoki '.' bo'lishi kerak.")
    return value


def check_email(value: str) -> str:
    value = value.strip().lower()
    if len(value) > 255 or not EMAIL_RE.match(value):
        raise ValueError("Email manzil noto'g'ri.")
    return value


def check_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Parol kamida 8 belgidan iborat bo'lishi kerak.")
    if len(value) > 128:
        raise ValueError("Parol juda uzun (ko'pi bilan 128 belgi).")
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("Parolda kamida bitta harf va bitta raqam bo'lishi kerak.")
    return value


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def _username(cls, value: str) -> str:
        return check_username(value)

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return check_email(value)

    @field_validator("password")
    @classmethod
    def _password(cls, value: str) -> str:
        return check_password(value)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    created_at: datetime


class UserUpdate(BaseModel):
    """PATCH /users/me — faqat yuborilgan maydonlar o'zgaradi."""

    username: str | None = None
    email: str | None = None
    current_password: str | None = Field(default=None, max_length=128)
    new_password: str | None = None

    @field_validator("username")
    @classmethod
    def _username(cls, value):
        return None if value is None else check_username(value)

    @field_validator("email")
    @classmethod
    def _email(cls, value):
        return None if value is None else check_email(value)

    @field_validator("new_password")
    @classmethod
    def _new_password(cls, value):
        return None if value is None else check_password(value)

    @model_validator(mode="after")
    def _need_current_password(self):
        if self.new_password and not self.current_password:
            raise ValueError("Parolni o'zgartirish uchun joriy parolni kiriting.")
        return self
