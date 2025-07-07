from src.domain.entities import Task
from src.domain.repositories import TaskRepository
from src.application.queries import GetTasksByStatusQuery


class GetTasksByStatusHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, query: GetTasksByStatusQuery) -> list[Task]:
        return await self.repository.get_by_status(query.is_done, query.is_archived)
