from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Task, TaskStatus, User


def today() -> date:
    """Testlarda almashtirish uchun alohida funksiya."""
    return date.today()


def _as_date(value: datetime) -> date:
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc)
    return value.date()


def get_stats(db: Session, owner: User) -> dict:
    mine = Task.owner_id == owner.id
    not_done = Task.status != TaskStatus.DONE.value
    now = today()

    by_status = dict(db.execute(select(Task.status, func.count()).where(mine).group_by(Task.status)).all())
    by_priority = dict(db.execute(select(Task.priority, func.count()).where(mine).group_by(Task.priority)).all())
    total = sum(by_status.values())
    done = by_status.get(TaskStatus.DONE.value, 0)

    overdue = db.scalar(select(func.count()).where(mine, not_done, Task.deadline < now)) or 0
    due_soon = (
        db.scalar(select(func.count()).where(mine, not_done, Task.deadline >= now, Task.deadline <= now + timedelta(days=7))) or 0
    )
    upcoming = db.scalars(
        select(Task).where(mine, not_done, Task.deadline.is_not(None)).order_by(Task.deadline.asc(), Task.id.asc()).limit(5)
    ).all()

    # Oxirgi 7 kun faolligi: yaratilgan va bajarilgan (status "done" ga o'tgan kun — updated_at bo'yicha)
    start = now - timedelta(days=6)
    since = datetime.combine(start, time.min, tzinfo=timezone.utc)
    days = {start + timedelta(days=i): {"created": 0, "completed": 0} for i in range(7)}
    for created_at, updated_at, status in db.execute(
        select(Task.created_at, Task.updated_at, Task.status).where(mine, (Task.created_at >= since) | (Task.updated_at >= since))
    ):
        created_day = _as_date(created_at)
        if created_day in days:
            days[created_day]["created"] += 1
        if status == TaskStatus.DONE.value:
            done_day = _as_date(updated_at)
            if done_day in days:
                days[done_day]["completed"] += 1

    return {
        "total": total,
        "todo": by_status.get(TaskStatus.TODO.value, 0),
        "in_progress": by_status.get(TaskStatus.IN_PROGRESS.value, 0),
        "done": done,
        "overdue": overdue,
        "due_soon": due_soon,
        "completion_rate": round(done * 100 / total) if total else 0,
        "by_priority": {k: by_priority.get(k, 0) for k in ("low", "medium", "high")},
        "upcoming": upcoming,
        "activity": [{"date": d, **v} for d, v in days.items()],
    }
