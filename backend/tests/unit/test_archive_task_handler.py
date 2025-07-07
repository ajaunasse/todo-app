from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.commands import ArchiveTaskCommand
from src.application.handlers import ArchiveTaskHandler
from src.domain.entities import Priority, Task


class TestArchiveTaskHandler:
    @pytest.mark.asyncio
    async def test_archive_task_success(self):
        """Test successfully archiving a completed task"""
        task_id = uuid4()
        done_task = Task.create(
            title="Completed Task",
            description="Task Description",
            priority=Priority.MEDIUM,
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        # Create the expected archived task that repository will return
        archived_task = Task.create(
            title="Completed Task",
            description="Task Description",
            priority=Priority.MEDIUM,
        )
        archived_task.id = task_id
        archived_task.mark_as_done()
        archived_task.archive()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = archived_task

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_archived is True
        assert result.is_done is True  # Should still be done
        assert result.title == "Completed Task"
        assert result.description == "Task Description"
        assert result.priority == Priority.MEDIUM
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_archive_task_not_completed(self):
        """Test archiving a pending task (should fail)"""
        task_id = uuid4()
        pending_task = Task.create(
            title="Pending Task", description="Still pending", priority=Priority.LOW
        )
        pending_task.id = task_id
        # Task is pending by default

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = pending_task

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        with pytest.raises(ValueError, match="Only completed tasks can be archived"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_archive_task_not_found(self):
        """Test archiving a non-existent task"""
        task_id = uuid4()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = None

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        with pytest.raises(ValueError, match=f"Task with id {task_id} not found"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_archive_task_preserves_properties(self):
        """Test that archiving preserves all task properties"""
        task_id = uuid4()
        done_task = Task.create(
            title="Important Completed Task",
            description="Very important and completed",
            priority=Priority.HIGH,
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        # Create the expected archived task
        archived_task = Task.create(
            title="Important Completed Task",
            description="Very important and completed",
            priority=Priority.HIGH,
        )
        archived_task.id = task_id
        archived_task.mark_as_done()
        archived_task.archive()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = archived_task

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_archived is True
        assert result.is_done is True
        assert result.title == "Important Completed Task"
        assert result.description == "Very important and completed"
        assert result.priority == Priority.HIGH
        assert result.id == task_id
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_archive_task_updates_timestamp(self):
        """Test that archiving updates the timestamp"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done
        original_creation_time = done_task.created_at

        # Create the expected archived task with updated timestamp
        archived_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        archived_task.id = task_id
        archived_task.created_at = original_creation_time  # Keep same creation time
        archived_task.mark_as_done()
        archived_task.archive()

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.return_value = archived_task

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        result = await handler.handle(command)

        assert result.is_archived is True
        assert result.created_at == original_creation_time  # Should not change
        assert result.updated_at >= original_creation_time  # Should be updated
        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_archive_task_with_all_priorities(self):
        """Test archiving tasks with different priorities"""
        priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH]

        for priority in priorities:
            task_id = uuid4()
            done_task = Task.create(
                title=f"Task {priority.value}",
                description=f"Task with {priority.value} priority",
                priority=priority,
            )
            done_task.id = task_id
            done_task.mark_as_done()  # First mark as done

            # Create the expected archived task
            archived_task = Task.create(
                title=f"Task {priority.value}",
                description=f"Task with {priority.value} priority",
                priority=priority,
            )
            archived_task.id = task_id
            archived_task.mark_as_done()
            archived_task.archive()

            mock_repository = AsyncMock()
            mock_repository.get_by_id.return_value = done_task
            mock_repository.update.return_value = archived_task

            handler = ArchiveTaskHandler(mock_repository)
            command = ArchiveTaskCommand(task_id=task_id)

            result = await handler.handle(command)

            assert result.is_archived is True
            assert result.is_done is True
            assert result.priority == priority
            mock_repository.get_by_id.assert_called_once_with(task_id)
            mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_archive_task_repository_error(self):
        """Test handling repository error when archiving task"""
        task_id = uuid4()
        done_task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.LOW
        )
        done_task.id = task_id
        done_task.mark_as_done()  # First mark as done

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = done_task
        mock_repository.update.side_effect = Exception("Database error")

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        with pytest.raises(Exception, match="Database error"):
            await handler.handle(command)

        mock_repository.get_by_id.assert_called_once_with(task_id)
        mock_repository.update.assert_called_once_with(done_task)

    @pytest.mark.asyncio
    async def test_archive_task_business_rule_validation(self):
        """Test that archive business rules are enforced in the domain entity"""
        task_id = uuid4()

        # Test 1: Cannot archive pending task
        pending_task = Task.create(
            title="Pending Task", description="Still pending", priority=Priority.LOW
        )
        pending_task.id = task_id

        mock_repository = AsyncMock()
        mock_repository.get_by_id.return_value = pending_task

        handler = ArchiveTaskHandler(mock_repository)
        command = ArchiveTaskCommand(task_id=task_id)

        with pytest.raises(ValueError, match="Only completed tasks can be archived"):
            await handler.handle(command)

        mock_repository.update.assert_not_called()  # Should not be called
