"""
Ishga tushirish:  uvicorn main:app --reload
Swagger:          http://127.0.0.1:8000/docs
"""
from app.main import app

__all__ = ["app"]
