from dataclasses import dataclass
from uuid import UUID


@dataclass
class ArchiveTaskCommand:
    task_id: UUID