from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(user: CurrentUser, db: DbSession):
    """Statistika har safar bazadagi haqiqiy ma'lumotlardan hisoblanadi."""
    return dashboard_service.get_stats(db, user)
