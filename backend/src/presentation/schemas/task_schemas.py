from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from ...domain.entities import Priority


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: str = Field(..., min_length=1, max_length=1000, description="Task description")
    priority: Priority = Field(..., description="Task priority (low, medium, high)")


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(
        None, min_length=1, max_length=1000, description="Task description"
    )
    priority: Optional[Priority] = Field(None, description="Task priority (low, medium, high)")


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str
    priority: Priority
    is_done: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ErrorResponse(BaseModel):
    detail: str
