from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: DbSession):
    """Ro'yxatdan o'tish. Javobda darhol token qaytadi — qayta login shart emas."""
    user = user_service.create_user(db, data)
    return Token(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession):
    """
    OAuth2 forma (application/x-www-form-urlencoded): `username` maydoniga username YOKI email yoziladi.
    Swagger'dagi "Authorize" tugmasi ham shu endpoint bilan ishlaydi.
    """
    user = user_service.authenticate(db, form.username, form.password)
    return Token(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser):
    return user
