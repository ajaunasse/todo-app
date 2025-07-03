from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...application.commands import ArchiveTaskCommand, CreateTaskCommand, MarkTaskDoneCommand, MarkTaskPendingCommand, ModifyTaskCommand
from ...application.handlers import (
    ArchiveTaskHandler,
    CreateTaskHandler,
    GetAllTasksHandler,
    GetTasksByStatusHandler,
    MarkTaskDoneHandler,
    MarkTaskPendingHandler,
    ModifyTaskHandler,
)
from ...application.queries import GetAllTasksQuery, GetTasksByStatusQuery
from ...infrastructure.database import database
from ...infrastructure.repositories import SQLiteTaskRepository
from ..schemas import TaskCreateRequest, TaskResponse, TaskUpdateRequest

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def get_db_session():
    async for session in database.get_session():
        yield session


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreateRequest, db: AsyncSession = Depends(get_db_session)):
    try:
        repository = SQLiteTaskRepository(db)
        handler = CreateTaskHandler(repository)
        command = CreateTaskCommand(
            title=task_data.title, description=task_data.description, priority=task_data.priority
        )
        task = await handler.handle(command)
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=list[TaskResponse])
async def get_all_tasks(db: AsyncSession = Depends(get_db_session)):
    repository = SQLiteTaskRepository(db)
    handler = GetAllTasksHandler(repository)
    query = GetAllTasksQuery()
    tasks = await handler.handle(query)
    return [
        TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
        for task in tasks
    ]


@router.get("/status/{is_done}", response_model=list[TaskResponse])
async def get_tasks_by_status(is_done: bool, db: AsyncSession = Depends(get_db_session)):
    repository = SQLiteTaskRepository(db)
    handler = GetTasksByStatusHandler(repository)
    query = GetTasksByStatusQuery(is_done=is_done, is_archived=false)
    tasks = await handler.handle(query)
    return [
        TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
        for task in tasks
    ]


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID, task_data: TaskUpdateRequest, db: AsyncSession = Depends(get_db_session)
):
    try:
        repository = SQLiteTaskRepository(db)
        handler = ModifyTaskHandler(repository)
        command = ModifyTaskCommand(
            task_id=task_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
        )
        task = await handler.handle(command)
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{task_id}/done", response_model=TaskResponse)
async def mark_task_done(task_id: UUID, db: AsyncSession = Depends(get_db_session)):
    try:
        repository = SQLiteTaskRepository(db)
        handler = MarkTaskDoneHandler(repository)
        command = MarkTaskDoneCommand(task_id=task_id)
        task = await handler.handle(command)
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{task_id}/pending", response_model=TaskResponse)
async def mark_task_pending(task_id: UUID, db: AsyncSession = Depends(get_db_session)):
    try:
        repository = SQLiteTaskRepository(db)
        handler = MarkTaskPendingHandler(repository)
        command = MarkTaskPendingCommand(task_id=task_id)
        task = await handler.handle(command)
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{task_id}/archive", response_model=TaskResponse)
async def archive_task(task_id: UUID, db: AsyncSession = Depends(get_db_session)):
    try:
        repository = SQLiteTaskRepository(db)
        handler = ArchiveTaskHandler(repository)
        command = ArchiveTaskCommand(task_id=task_id)
        task = await handler.handle(command)
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            is_done=task.is_done,
            is_archived=task.is_archived,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
