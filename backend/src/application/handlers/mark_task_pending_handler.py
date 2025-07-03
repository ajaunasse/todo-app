from ...domain.entities import Task
from ...domain.repositories import TaskRepository
from ..commands import MarkTaskPendingCommand


class MarkTaskPendingHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, command: MarkTaskPendingCommand) -> Task:
        task = await self.repository.get_by_id(command.task_id)
        if not task:
            raise ValueError(f"Task with id {command.task_id} not found")

        task.mark_as_pending()
        return await self.repository.update(task)