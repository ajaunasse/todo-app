from dataclasses import dataclass
from uuid import UUID


@dataclass
class MarkTaskPendingCommand:
    task_id: UUID
