from typing import Optional
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities import Priority, Task
from src.domain.repositories import TaskRepository
from src.infrastructure.database.models import TaskModel


class SQLiteTaskRepository(TaskRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, model: TaskModel) -> Task:
        return Task(
            id=UUID(model.id),
            title=model.title,
            description=model.description,
            priority=model.priority,
            is_done=model.is_done,
            is_archived=model.is_archived,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Task) -> TaskModel:
        return TaskModel(
            id=str(entity.id),
            title=entity.title,
            description=entity.description,
            priority=entity.priority,
            is_done=entity.is_done,
            is_archived=entity.is_archived,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    async def create(self, task: Task) -> Task:
        model = self._to_model(task)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        result = await self.session.execute(select(TaskModel).where(TaskModel.id == str(task_id)))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Task]:
        priority_order = case(
            (TaskModel.priority == Priority.HIGH, 3),
            (TaskModel.priority == Priority.MEDIUM, 2),
            (TaskModel.priority == Priority.LOW, 1),
            else_=0
        )
        result = await self.session.execute(
            select(TaskModel).order_by(priority_order.desc(), TaskModel.created_at.desc())
        )
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_by_status(self, is_done: bool, is_archived: bool) -> list[Task]:
        priority_order = case(
            (TaskModel.priority == Priority.HIGH, 3),
            (TaskModel.priority == Priority.MEDIUM, 2),
            (TaskModel.priority == Priority.LOW, 1),
            else_=0
        )
        result = await self.session.execute(
            select(TaskModel)
            .where(TaskModel.is_done == is_done)
            .where(TaskModel.is_archived == is_archived)
            .order_by(priority_order.desc(), TaskModel.created_at.desc())
        )
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def update(self, task: Task) -> Task:
        result = await self.session.execute(select(TaskModel).where(TaskModel.id == str(task.id)))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Task with id {task.id} not found")

        model.title = task.title
        model.description = task.description
        model.priority = task.priority
        model.is_done = task.is_done
        model.is_archived = task.is_archived
        model.updated_at = task.updated_at

        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def delete(self, task_id: UUID) -> bool:
        result = await self.session.execute(select(TaskModel).where(TaskModel.id == str(task_id)))
        model = result.scalar_one_or_none()
        if not model:
            return False

        await self.session.delete(model)
        await self.session.commit()
        return True

    async def count_by_priority(self, priority: Priority) -> int:
        result = await self.session.execute(
            select(func.count(TaskModel.id))
            .where(TaskModel.priority == priority)
            .where(TaskModel.is_done == False)
        )
        return result.scalar() or 0
