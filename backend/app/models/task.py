from datetime import date, datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import utcnow

if TYPE_CHECKING:
    from app.models.user import User


class TaskStatus(StrEnum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        # Qiymatlar bazaning o'zida ham tekshiriladi (PostgreSQL va SQLite'da bir xil ishlaydi)
        CheckConstraint("status IN ('todo', 'in_progress', 'done')", name="ck_tasks_status"),
        CheckConstraint("priority IN ('low', 'medium', 'high')", name="ck_tasks_priority"),
        Index("ix_tasks_owner_status", "owner_id", "status"),
        Index("ix_tasks_owner_deadline", "owner_id", "deadline"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default=TaskStatus.TODO.value)
    priority: Mapped[str] = mapped_column(String(10), default=TaskPriority.MEDIUM.value)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    owner: Mapped["User"] = relationship(back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task {self.id} {self.status}>"
