from src.domain.entities import Task
from src.domain.repositories import TaskRepository
from src.application.commands import MarkTaskDoneCommand


class MarkTaskDoneHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, command: MarkTaskDoneCommand) -> Task:
        task = await self.repository.get_by_id(command.task_id)
        if not task:
            raise ValueError(f"Task with id {command.task_id} not found")

        task.mark_as_done()
        return await self.repository.update(task)
