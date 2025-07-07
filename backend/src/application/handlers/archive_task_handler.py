from src.domain.entities import Task
from src.domain.repositories import TaskRepository
from src.application.commands import ArchiveTaskCommand


class ArchiveTaskHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, command: ArchiveTaskCommand) -> Task:
        task = await self.repository.get_by_id(command.task_id)
        if not task:
            raise ValueError(f"Task with id {command.task_id} not found")

        task.archive()
        return await self.repository.update(task)
