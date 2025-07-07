from unittest.mock import AsyncMock

import pytest

from src.application.commands import CreateTaskCommand
from src.application.handlers import CreateTaskHandler
from src.domain.entities import Priority, Task


class TestCreateTaskHandler:
    @pytest.mark.asyncio
    async def test_create_task_success(self):
        mock_repository = AsyncMock()
        mock_repository.count_by_priority.return_value = 2
        mock_repository.create.return_value = Task.create(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )

        handler = CreateTaskHandler(mock_repository)
        command = CreateTaskCommand(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )

        result = await handler.handle(command)

        assert result.title == "Test Task"
        assert result.description == "Test Description"
        assert result.priority == Priority.HIGH
        mock_repository.count_by_priority.assert_called_once_with(Priority.HIGH)
        mock_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_task_high_priority_limit_exceeded(self):
        mock_repository = AsyncMock()
        mock_repository.count_by_priority.return_value = 5

        handler = CreateTaskHandler(mock_repository)
        command = CreateTaskCommand(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )

        with pytest.raises(
            ValueError, match="Cannot create more than 5 tasks with high priority"
        ):
            await handler.handle(command)

        mock_repository.count_by_priority.assert_called_once_with(Priority.HIGH)
        mock_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_create_task_non_high_priority_no_limit_check(self):
        mock_repository = AsyncMock()
        mock_repository.create.return_value = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )

        handler = CreateTaskHandler(mock_repository)
        command = CreateTaskCommand(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )

        result = await handler.handle(command)

        assert result.priority == Priority.LOW
        mock_repository.count_by_priority.assert_not_called()
        mock_repository.create.assert_called_once()
