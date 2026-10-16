from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppError


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=f"{settings.app_name} API",
        description="Task Management System — vazifalar, muddatlar va statistika.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,  # faqat .env dagi frontend manzillari
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
