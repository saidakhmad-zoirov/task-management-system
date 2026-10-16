from typing import Annotated

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.task import PriorityLiteral, SortLiteral, StatusLiteral, TaskCreate, TaskPage, TaskRead, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=TaskPage)
def list_tasks(
    user: CurrentUser,
    db: DbSession,
    search: Annotated[str | None, Query(max_length=100)] = None,
    status_: Annotated[StatusLiteral | None, Query(alias="status")] = None,
    priority: PriorityLiteral | None = None,
    sort: SortLiteral = "-created_at",
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=50)] = 10,
):
    return task_service.list_tasks(
        db, user, search=search, status=status_, priority=priority, sort=sort, page=page, size=size
    )


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, user: CurrentUser, db: DbSession):
    return task_service.create_task(db, user, data)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, user: CurrentUser, db: DbSession):
    return task_service.get_task(db, user, task_id)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, data: TaskUpdate, user: CurrentUser, db: DbSession):
    return task_service.update_task(db, user, task_id, data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, user: CurrentUser, db: DbSession):
    task_service.delete_task(db, user, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
