from datetime import date

from pydantic import BaseModel

from app.schemas.task import TaskRead


class PriorityCounts(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0


class DayActivity(BaseModel):
    date: date
    created: int
    completed: int


class DashboardStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    done: int
    overdue: int
    due_soon: int  # keyingi 7 kun ichida muddati tugaydigan, bajarilmagan
    completion_rate: int  # foiz, 0–100
    by_priority: PriorityCounts
    upcoming: list[TaskRead]  # eng yaqin muddatli 5 ta bajarilmagan vazifa
    activity: list[DayActivity]  # oxirgi 7 kun
