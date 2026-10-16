from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.user import UserRead, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(user: CurrentUser):
    return user


@router.patch("/me", response_model=UserRead)
def update_me(data: UserUpdate, user: CurrentUser, db: DbSession):
    return user_service.update_user(db, user, data)
