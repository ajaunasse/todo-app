
from ...domain.entities import Task
from ...domain.repositories import TaskRepository
from ..queries import GetAllTasksQuery


class GetAllTasksHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, query: GetAllTasksQuery) -> list[Task]:
        return await self.repository.get_all()
