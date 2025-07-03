from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from ..entities import Priority, Task


class TaskRepository(ABC):
    @abstractmethod
    async def create(self, task: Task) -> Task:
        pass

    @abstractmethod
    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        pass

    @abstractmethod
    async def get_all(self) -> list[Task]:
        pass

    @abstractmethod
    async def get_by_status(self, is_done: bool, is_archived: bool) -> list[Task]:
        pass

    @abstractmethod
    async def update(self, task: Task) -> Task:
        pass

    @abstractmethod
    async def delete(self, task_id: UUID) -> bool:
        pass

    @abstractmethod
    async def count_by_priority(self, priority: Priority) -> int:
        pass
