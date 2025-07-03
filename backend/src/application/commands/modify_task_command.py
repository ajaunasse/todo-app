from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from ...domain.entities import Priority


@dataclass
class ModifyTaskCommand:
    task_id: UUID
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
