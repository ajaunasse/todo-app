from dataclasses import dataclass

from ...domain.entities import Priority


@dataclass
class CreateTaskCommand:
    title: str
    description: str
    priority: Priority
