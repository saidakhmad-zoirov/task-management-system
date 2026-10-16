from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError, AuthError, ConflictError
from app.core.security import hash_password, verify_password
from app.models import User
from app.schemas.user import UserCreate, UserUpdate


def get_by_login(db: Session, login: str) -> User | None:
    """Username yoki email bo'yicha (katta-kichik harf farqsiz) topadi."""
    login = login.strip().lower()
    stmt = select(User).where(or_(func.lower(User.username) == login, User.email == login))
    return db.scalars(stmt).first()


def _ensure_unique(db: Session, *, username: str | None = None, email: str | None = None, exclude_id: int | None = None):
    if username:
        stmt = select(User.id).where(func.lower(User.username) == username.lower())
        if exclude_id:
            stmt = stmt.where(User.id != exclude_id)
        if db.scalar(stmt):
            raise ConflictError("Bu username band.")
    if email:
        stmt = select(User.id).where(User.email == email)
        if exclude_id:
            stmt = stmt.where(User.id != exclude_id)
        if db.scalar(stmt):
            raise ConflictError("Bu email allaqachon ro'yxatdan o'tgan.")


def create_user(db: Session, data: UserCreate) -> User:
    _ensure_unique(db, username=data.username, email=data.email)
    user = User(username=data.username, email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, login: str, password: str) -> User:
    user = get_by_login(db, login)
    # Foydalanuvchi topilmasa ham xuddi shu xabar — qaysi biri xato ekanini oshkor qilmaymiz
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError("Login yoki parol noto'g'ri.")
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    changes = data.model_dump(exclude_unset=True)
    _ensure_unique(db, username=changes.get("username"), email=changes.get("email"), exclude_id=user.id)
    if data.new_password:
        if not verify_password(data.current_password or "", user.password_hash):
            # 400 (401 emas): frontend 401 ni "sessiya tugadi" deb tushunib, foydalanuvchini chiqarib yuboradi
            raise AppError("Joriy parol noto'g'ri.")
        user.password_hash = hash_password(data.new_password)
    if changes.get("username"):
        user.username = changes["username"]
    if changes.get("email"):
        user.email = changes["email"]
    db.commit()
    db.refresh(user)
    return user
