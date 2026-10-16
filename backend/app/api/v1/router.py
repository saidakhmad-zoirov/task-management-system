from fastapi import APIRouter

from app.api.v1 import auth, dashboard, tasks, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
api_router.include_router(dashboard.router)


@api_router.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
