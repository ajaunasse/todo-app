from dataclasses import dataclass
from uuid import UUID


@dataclass
class MarkTaskDoneCommand:
    task_id: UUID
