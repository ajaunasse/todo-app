from dataclasses import dataclass
from datetime import datetime, UTC
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class Task:
    id: UUID
    title: str
    description: str
    priority: Priority
    is_done: bool = False
    is_archived: bool = False
    created_at: Optional[datetime] = (None,)
    updated_at: Optional[datetime] = (None,)

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(UTC)
        if self.updated_at is None:
            self.updated_at = datetime.now(UTC)

    @classmethod
    def create(cls, title: str, description: str, priority: Priority) -> "Task":
        return cls(
            id=uuid4(),
            title=title,
            description=description,
            priority=priority,
            is_done=False,
            is_archived=False,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

    def mark_as_done(self) -> None:
        self.is_done = True
        self.updated_at = datetime.now(UTC)

    def mark_as_pending(self) -> None:
        self.is_done = False
        self.updated_at = datetime.now(UTC)

    def archive(self) -> None:
        if not self.is_done:
            raise ValueError("Only completed tasks can be archived")
        self.is_archived = True
        self.updated_at = datetime.now(UTC)

    def update(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[Priority] = None,
    ) -> None:
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if priority is not None:
            self.priority = priority
        self.updated_at = datetime.now(UTC)
