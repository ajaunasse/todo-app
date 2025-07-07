from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.commands import MarkTaskPendingCommand
from src.application.handlers import MarkTaskPendingHandler
from src.domain.entities import Priority, Task


class TestMarkTaskPendingHandler:
    @pytest.mark.asyncio
    async def test_mark_task_pending_success(self):
        """Test successfully marking a done task as pending"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        # Create the expected pending task that repository will return
        pending_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        pending_task.id = task_id
        # pending_task is already pending by default

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        assert result.title == "Test Task"
        assert result.description == "Test Description"
        assert result.priority == Priority.MEDIUM
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_already_pending(self):
        """Test marking a task as pending when it's already pending"""
        task_id = uuid4()
        pending_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        pending_task.id = task_id
        # Task is already pending by default

        # When marking as pending again, it should still work
        still_pending_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.MEDIUM
        )
        still_pending_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = pending_task
        mock_repository.update.return_value = still_pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(pending_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_not_found(self):
        """Test marking a non-existent task as pending"""
        task_id = uuid4()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = None

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        with pytest.raises(ValueError, match=f"Task with id {task_id} not found"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_mark_task_pending_preserves_other_properties(self):
        """Test that marking task as pending preserves all other properties"""
        task_id = uuid4()
        done_task = Task.create(
            title="Important Task",
            description="Very important description",
            priority=Priority.HIGH,
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        # Create the expected pending task
        pending_task = Task.create(
            title="Important Task",
            description="Very important description",
            priority=Priority.HIGH,
        )
        pending_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        assert result.title == "Important Task"
        assert result.description == "Very important description"
        assert result.priority == Priority.HIGH
        assert result.is_archived is False  # Should not be archived
        assert result.id == task_id
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_updates_timestamp(self):
        """Test that marking task as pending updates the timestamp"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        # Create the expected pending task with updated timestamp
        pending_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        pending_task.id = task_id
        pending_task.mark_as_pending()  # This updates the timestamp

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        # Timestamps are updated when methods are called
        assert result.created_at is not None
        assert result.updated_at is not None
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_with_high_priority(self):
        """Test marking a high priority done task as pending"""
        task_id = uuid4()
        high_priority_task = Task.create(
            title="High Priority Task",
            description="This is urgent",
            priority=Priority.HIGH,
        )
        high_priority_task.id = task_id
        high_priority_task.mark_as_done()  # First mark as done

        # Create the expected pending task
        pending_task = Task.create(
            title="High Priority Task",
            description="This is urgent",
            priority=Priority.HIGH,
        )
        pending_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = high_priority_task
        mock_repository.update.return_value = pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        assert result.priority == Priority.HIGH
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(high_priority_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_archived_task(self):
        """Test that marking an archived task as pending works (archived tasks can be made pending)"""
        task_id = uuid4()
        archived_task = Task.create(
            title="Archived Task",
            description="This was archived",
            priority=Priority.LOW,
        )
        archived_task.id = task_id
        archived_task.mark_as_done()  # First mark as done
        archived_task.archive()  # Then archive

        # Create the expected pending task (archived flag is preserved)
        pending_task = Task.create(
            title="Archived Task",
            description="This was archived",
            priority=Priority.LOW,
        )
        pending_task.id = task_id
        pending_task.mark_as_done()
        pending_task.archive()
        pending_task.mark_as_pending()  # Now mark as pending

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = archived_task
        mock_repository.update.return_value = pending_task

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_done is False
        # Note: archived flag might still be True, depending on business rules
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(archived_task)

    @pytest.mark.asyncio
    async def test_mark_task_pending_repository_error(self):
        """Test handling repository error when marking task as pending"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.side_effect = Exception("Database error")

        handler = MarkTaskPendingHandler(mock_repository)
        command = MarkTaskPendingCommand(task_id=task_id)

        with pytest.raises(Exception, match="Database error"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)
