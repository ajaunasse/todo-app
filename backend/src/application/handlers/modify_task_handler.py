from src.domain.entities import Priority, Task
from src.domain.repositories import TaskRepository
from src.application.commands import ModifyTaskCommand


class ModifyTaskHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, command: ModifyTaskCommand) -> Task:
        task = await self.repository.get_by_id(command.task_id)
        if not task:
            raise ValueError(f"Task with id {command.task_id} not found")

        if command.priority == Priority.HIGH and task.priority != Priority.HIGH:
            high_priority_count = await self.repository.count_by_priority(Priority.HIGH)
            if high_priority_count >= 5:
                raise ValueError(
                    "Cannot modify task to high priority. Maximum of 5 high priority tasks allowed"
                )

        task.update(title=command.title, description=command.description, priority=command.priority)

        return await self.repository.update(task)
