from src.domain.entities import Priority, Task
from src.domain.repositories import TaskRepository
from src.application.commands import CreateTaskCommand


class CreateTaskHandler:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def handle(self, command: CreateTaskCommand) -> Task:
        if command.priority == Priority.HIGH:
            high_priority_count = await self.repository.count_by_priority(Priority.HIGH)
            if high_priority_count >= 5:
                raise ValueError("Cannot create more than 5 tasks with high priority")

        task = Task.create(
            title=command.title,
            description=command.description,
            priority=command.priority,
        )

        return await self.repository.create(task)
