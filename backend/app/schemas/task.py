from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.models.task import TaskPriority, TaskStatus

StatusLiteral = Literal["todo", "in_progress", "done"]
PriorityLiteral = Literal["low", "medium", "high"]
SortLiteral = Literal["-created_at", "created_at", "deadline", "-deadline", "priority", "title"]


def clean_title(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Sarlavha bo'sh bo'lmasligi kerak.")
    return value


class TaskCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=5000)
    status: StatusLiteral = TaskStatus.TODO.value
    priority: PriorityLiteral = TaskPriority.MEDIUM.value
    deadline: date | None = None

    @field_validator("title")
    @classmethod
    def _title(cls, value: str) -> str:
        return clean_title(value)


class TaskUpdate(BaseModel):
    """Qisman yangilash. deadline ni null yuborsa — muddat olib tashlanadi."""

    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: StatusLiteral | None = None
    priority: PriorityLiteral | None = None
    deadline: date | None = None

    @field_validator("title")
    @classmethod
    def _title(cls, value):
        return None if value is None else clean_title(value)


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: StatusLiteral
    priority: PriorityLiteral
    deadline: date | None
    created_at: datetime
    updated_at: datetime
    owner_id: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_overdue(self) -> bool:
        return self.deadline is not None and self.status != TaskStatus.DONE.value and self.deadline < date.today()


class TaskPage(BaseModel):
    items: list[TaskRead]
    total: int
    page: int
    size: int
    pages: int
