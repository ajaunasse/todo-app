
from ...domain.entities import Task
from ...domain.repositories import TaskRepository
from ..queries import GetTasksByStatusQuery


class GetTasksByStatusHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, query: GetTasksByStatusQuery) -> list[Task]:
        return await self.repository.get_by_status(query.is_done, query.is_archived)
