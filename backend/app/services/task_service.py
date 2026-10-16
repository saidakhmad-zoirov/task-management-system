import math

from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import Task, User
from app.schemas.task import TaskCreate, TaskUpdate

PRIORITY_RANK = case({"high": 0, "medium": 1, "low": 2}, value=Task.priority)

SORTS = {
    "-created_at": (Task.created_at.desc(), Task.id.desc()),
    "created_at": (Task.created_at.asc(), Task.id.asc()),
    # Muddati yo'q vazifalar har doim oxirida
    "deadline": (Task.deadline.is_(None), Task.deadline.asc(), Task.id.asc()),
    "-deadline": (Task.deadline.is_(None), Task.deadline.desc(), Task.id.desc()),
    "priority": (PRIORITY_RANK, Task.deadline.is_(None), Task.deadline.asc(), Task.id.asc()),
    "title": (func.lower(Task.title).asc(), Task.id.asc()),
}


def list_tasks(
    db: Session,
    owner: User,
    *,
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    sort: str = "-created_at",
    page: int = 1,
    size: int = 10,
) -> dict:
    stmt = select(Task).where(Task.owner_id == owner.id)  # faqat o'z vazifalari
    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(or_(Task.title.ilike(pattern), Task.description.ilike(pattern)))
    if status:
        stmt = stmt.where(Task.status == status)
    if priority:
        stmt = stmt.where(Task.priority == priority)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    pages = max(1, math.ceil(total / size))
    items = db.scalars(stmt.order_by(*SORTS.get(sort, SORTS["-created_at"])).offset((page - 1) * size).limit(size)).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}


def get_task(db: Session, owner: User, task_id: int) -> Task:
    """Boshqa foydalanuvchining vazifasi uchun ham 404 — uning mavjudligini oshkor qilmaymiz."""
    task = db.scalar(select(Task).where(Task.id == task_id, Task.owner_id == owner.id))
    if task is None:
        raise NotFoundError("Vazifa topilmadi.")
    return task


def create_task(db: Session, owner: User, data: TaskCreate) -> Task:
    task = Task(**data.model_dump(), owner_id=owner.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, owner: User, task_id: int, data: TaskUpdate) -> Task:
    task = get_task(db, owner, task_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        if field in {"title", "status", "priority", "description"} and value is None:
            continue  # bu maydonlarni null qilib bo'lmaydi
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, owner: User, task_id: int) -> None:
    task = get_task(db, owner, task_id)
    db.delete(task)
    db.commit()
