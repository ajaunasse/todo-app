from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.commands import ModifyTaskCommand
from src.application.handlers import ModifyTaskHandler
from src.domain.entities import Priority, Task


class TestModifyTaskHandler:
    @pytest.mark.asyncio
    async def test_modify_task_success(self):
        """Test successful task modification"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Original Task",
            description="Original Description",
            priority=Priority.LOW,
        )
        existing_task.id = task_id

        # The handler will modify the task in place and return the updated version from repository
        updated_task = Task.create(
            title="Updated Task",
            description="Updated Description",
            priority=Priority.MEDIUM,
        )
        updated_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(
            task_id=task_id,
            title="Updated Task",
            description="Updated Description",
            priority=Priority.MEDIUM,
        )

        result = await handler.handle(command)

        assert result.title == "Updated Task"
        assert result.description == "Updated Description"
        assert result.priority == Priority.MEDIUM
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(existing_task)
        mock_repository.count_by_priority.assert_not_called()

    @pytest.mark.asyncio
    async def test_modify_task_partial_update(self):
        """Test partial task modification (only title)"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Original Task",
            description="Original Description",
            priority=Priority.LOW,
        )
        existing_task.id = task_id

        # The handler will modify the task in place and return the updated version from repository
        updated_task = Task.create(
            title="Updated Task",
            description="Original Description",
            priority=Priority.LOW,
        )
        updated_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, title="Updated Task")

        result = await handler.handle(command)

        assert result.title == "Updated Task"
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(existing_task)

    @pytest.mark.asyncio
    async def test_modify_task_priority_to_high_success(self):
        """Test modifying task priority to HIGH when under limit"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        existing_task.id = task_id

        # The handler will modify the task in place and return the updated version from repository
        updated_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )
        updated_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.count_by_priority.return_value = 3
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, priority=Priority.HIGH)

        result = await handler.handle(command)

        assert result.priority == Priority.HIGH
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.count_by_priority.assert_called_once_with(Priority.HIGH)
        mock_repository.update.assert_called_once_with(existing_task)

    @pytest.mark.asyncio
    async def test_modify_task_priority_to_high_limit_exceeded(self):
        """Test modifying task priority to HIGH when limit exceeded"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        existing_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.count_by_priority.return_value = 5

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, priority=Priority.HIGH)

        with pytest.raises(
            ValueError,
            match="Cannot modify task to high priority. Maximum of 5 high priority tasks allowed",
        ):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.count_by_priority.assert_called_once_with(Priority.HIGH)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_modify_task_already_high_priority_no_limit_check(self):
        """Test modifying task that already has HIGH priority (no limit check)"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )
        existing_task.id = task_id

        # The handler will modify the task in place and return the updated version from repository
        updated_task = Task.create(
            title="Updated Task", description="Test Description", priority=Priority.HIGH
        )
        updated_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, title="Updated Task")

        result = await handler.handle(command)

        assert result.title == "Updated Task"
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.count_by_priority.assert_not_called()
        mock_repository.update.assert_called_once_with(existing_task)

    @pytest.mark.asyncio
    async def test_modify_task_not_found(self):
        """Test modifying non-existent task"""
        task_id = uuid4()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = None

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, title="Updated Task")

        with pytest.raises(ValueError, match=f"Task with id {task_id} not found"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_modify_task_no_changes(self):
        """Test modifying task with no actual changes"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        existing_task.id = task_id

        # Update with no changes - task remains the same
        updated_task = existing_task

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.title == "Test Task"
        assert result.description == "Test Description"
        assert result.priority == Priority.LOW
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(existing_task)

    @pytest.mark.asyncio
    async def test_modify_task_priority_from_high_to_low(self):
        """Test modifying task priority from HIGH to LOW (no limit check)"""
        task_id = uuid4()
        existing_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )
        existing_task.id = task_id

        # The handler will modify the task in place and return the updated version from repository
        updated_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        updated_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = existing_task
        mock_repository.update.return_value = updated_task

        handler = ModifyTaskHandler(mock_repository)
        command = ModifyTaskCommand(task_id=task_id, priority=Priority.LOW)

        result = await handler.handle(command)

        assert result.priority == Priority.LOW
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.count_by_priority.assert_not_called()
        mock_repository.update.assert_called_once_with(existing_task)
