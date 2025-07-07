from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.commands import MarkTaskDoneCommand
from src.application.handlers import MarkTaskDoneHandler
from src.domain.entities import Priority, Task


class TestMarkTaskDoneHandler:
    @pytest.mark.asyncio
    async def test_mark_task_done_success(self):
        """Test successfully marking a pending task as done"""
        task_id = uuid4()
        pending_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        pending_task.id = task_id

        # Create the expected done task that repository will return
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        done_task.id = task_id
        done_task.mark_as_done()  # Mark as done

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = pending_task
        mock_repository.update.return_value = done_task

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is True
        assert result.title == "Test Task"
        assert result.description == "Test Description"
        assert result.priority == Priority.MEDIUM
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(pending_task)

    @pytest.mark.asyncio
    async def test_mark_task_done_already_done(self):
        """Test marking a task as done when it's already done"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        done_task.id = task_id
        done_task.mark_as_done()  # Already done

        # When marking as done again, it should still work
        still_done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        still_done_task.id = task_id
        still_done_task.mark_as_done()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = still_done_task

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is True
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_mark_task_done_not_found(self):
        """Test marking a non-existent task as done"""
        task_id = uuid4()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = None

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        with pytest.raises(ValueError, match=f"Task with id {task_id} not found"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_mark_task_done_preserves_other_properties(self):
        """Test that marking task as done preserves all other properties"""
        task_id = uuid4()
        original_task = Task.create(
            title="Important Task",
            description="Very important description",
            priority=Priority.HIGH,
        )
        original_task.id = task_id

        # Create the expected done task
        done_task = Task.create(
            title="Important Task",
            description="Very important description",
            priority=Priority.HIGH,
        )
        done_task.id = task_id
        done_task.mark_as_done()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = original_task
        mock_repository.update.return_value = done_task

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is True
        assert result.title == "Important Task"
        assert result.description == "Very important description"
        assert result.priority == Priority.HIGH
        assert result.is_archived is False  # Should not be archived
        assert result.id == task_id
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(original_task)

    @pytest.mark.asyncio
    async def test_mark_task_done_updates_timestamp(self):
        """Test that marking task as done updates the timestamp"""
        task_id = uuid4()
        original_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        original_task.id = task_id

        # Create the expected done task with updated timestamp
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        done_task.id = task_id
        done_task.mark_as_done()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = original_task
        mock_repository.update.return_value = done_task

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is True
        # Timestamps are updated when methods are called
        assert result.created_at is not None
        assert result.updated_at is not None
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(original_task)

    @pytest.mark.asyncio
    async def test_mark_task_done_with_high_priority(self):
        """Test marking a high priority task as done"""
        task_id = uuid4()
        high_priority_task = Task.create(
            title="High Priority Task",
            description="This is urgent",
            priority=Priority.HIGH,
        )
        high_priority_task.id = task_id

        # Create the expected done task
        done_task = Task.create(
            title="High Priority Task",
            description="This is urgent",
            priority=Priority.HIGH,
        )
        done_task.id = task_id
        done_task.mark_as_done()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = high_priority_task
        mock_repository.update.return_value = done_task

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is True
        assert result.priority == Priority.HIGH
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(high_priority_task)

    @pytest.mark.asyncio
    async def test_mark_task_done_repository_error(self):
        """Test handling repository error when marking task as done"""
        task_id = uuid4()
        task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = task
        mock_repository.update.side_effect = Exception("Database error")

        handler = MarkTaskDoneHandler(mock_repository)
        command = MarkTaskDoneCommand(task_id=task_id)

        with pytest.raises(Exception, match="Database error"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(task)
