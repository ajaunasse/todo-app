from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.handlers import GetTasksByStatusHandler
from src.application.queries import GetTasksByStatusQuery
from src.domain.entities import Priority, Task


class TestGetTasksByStatusHandler:
    @pytest.mark.asyncio
    async def test_get_pending_tasks_success(self):
        """Test successfully retrieving pending tasks"""
        pending_task1 = Task.create(
            title="Pending Task 1", description="First pending", priority=Priority.HIGH
        )
        pending_task1.id = uuid4()

        pending_task2 = Task.create(
            title="Pending Task 2", description="Second pending", priority=Priority.LOW
        )
        pending_task2.id = uuid4()

        expected_tasks = [pending_task1, pending_task2]

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = expected_tasks

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=False, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 2
        assert all(not task.is_done for task in result)
        assert all(not task.is_archived for task in result)
        assert result[0].title == "Pending Task 1"
        assert result[1].title == "Pending Task 2"
        mock_repository.get_by_status.assert_called_once_with(False, False)

    @pytest.mark.asyncio
    async def test_get_done_tasks_success(self):
        """Test successfully retrieving done (but not archived) tasks"""
        done_task1 = Task.create(
            title="Done Task 1", description="First done", priority=Priority.MEDIUM
        )
        done_task1.id = uuid4()
        done_task1.mark_as_done()

        done_task2 = Task.create(
            title="Done Task 2", description="Second done", priority=Priority.HIGH
        )
        done_task2.id = uuid4()
        done_task2.mark_as_done()

        expected_tasks = [done_task1, done_task2]

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = expected_tasks

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 2
        assert all(task.is_done for task in result)
        assert all(not task.is_archived for task in result)
        assert result[0].title == "Done Task 1"
        assert result[1].title == "Done Task 2"
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_archived_tasks_success(self):
        """Test successfully retrieving archived tasks"""
        archived_task1 = Task.create(
            title="Archived Task 1", description="First archived", priority=Priority.LOW
        )
        archived_task1.id = uuid4()
        archived_task1.mark_as_done()
        archived_task1.archive()

        archived_task2 = Task.create(
            title="Archived Task 2",
            description="Second archived",
            priority=Priority.MEDIUM,
        )
        archived_task2.id = uuid4()
        archived_task2.mark_as_done()
        archived_task2.archive()

        expected_tasks = [archived_task1, archived_task2]

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = expected_tasks

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=True)

        result = await handler.handle(query)

        assert len(result) == 2
        assert all(task.is_done for task in result)
        assert all(task.is_archived for task in result)
        assert result[0].title == "Archived Task 1"
        assert result[1].title == "Archived Task 2"
        mock_repository.get_by_status.assert_called_once_with(True, True)

    @pytest.mark.asyncio
    async def test_get_tasks_empty_result(self):
        """Test retrieving tasks when no tasks match the status"""
        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = []

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert result == []
        assert len(result) == 0
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_tasks_single_result(self):
        """Test retrieving tasks with only one matching task"""
        single_task = Task.create(
            title="Single Done Task",
            description="Only done task",
            priority=Priority.HIGH,
        )
        single_task.id = uuid4()
        single_task.mark_as_done()

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = [single_task]

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 1
        assert result[0].title == "Single Done Task"
        assert result[0].is_done is True
        assert result[0].is_archived is False
        assert result[0].priority == Priority.HIGH
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_tasks_mixed_priorities(self):
        """Test retrieving tasks with different priorities but same status"""
        low_task = Task.create(
            title="Low Priority Done", description="Low priority", priority=Priority.LOW
        )
        low_task.id = uuid4()
        low_task.mark_as_done()

        medium_task = Task.create(
            title="Medium Priority Done",
            description="Medium priority",
            priority=Priority.MEDIUM,
        )
        medium_task.id = uuid4()
        medium_task.mark_as_done()

        high_task = Task.create(
            title="High Priority Done",
            description="High priority",
            priority=Priority.HIGH,
        )
        high_task.id = uuid4()
        high_task.mark_as_done()

        tasks = [low_task, medium_task, high_task]

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = tasks

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 3
        assert all(task.is_done for task in result)
        assert all(not task.is_archived for task in result)

        priorities = [task.priority for task in result]
        assert Priority.LOW in priorities
        assert Priority.MEDIUM in priorities
        assert Priority.HIGH in priorities
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_tasks_repository_error(self):
        """Test handling repository error when getting tasks by status"""
        mock_repository = AsyncMock()
        mock_repository.get_by_status.side_effect = Exception("Database query error")

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=False, is_archived=False)

        with pytest.raises(Exception, match="Database query error"):
            await handler.handle(query)

        mock_repository.get_by_status.assert_called_once_with(False, False)

    @pytest.mark.asyncio
    async def test_get_tasks_all_status_combinations(self):
        """Test all possible status combinations"""
        # Test all four combinations of is_done and is_archived
        status_combinations = [
            (False, False),  # Pending, not archived
            (True, False),  # Done, not archived
            (True, True),  # Done and archived
            # Note: (False, True) - Pending and archived - is not valid business state
        ]

        for is_done, is_archived in status_combinations:
            mock_repository = AsyncMock()
            mock_repository.get_by_status.return_value = []

            handler = GetTasksByStatusHandler(mock_repository)
            query = GetTasksByStatusQuery(is_done=is_done, is_archived=is_archived)

            result = await handler.handle(query)

            assert result == []
            mock_repository.get_by_status.assert_called_once_with(is_done, is_archived)

    @pytest.mark.asyncio
    async def test_get_tasks_preserves_order(self):
        """Test that get tasks by status preserves the order returned by repository"""
        task1 = Task.create(
            title="First Done", description="First", priority=Priority.LOW
        )
        task1.id = uuid4()
        task1.mark_as_done()

        task2 = Task.create(
            title="Second Done", description="Second", priority=Priority.HIGH
        )
        task2.id = uuid4()
        task2.mark_as_done()

        task3 = Task.create(
            title="Third Done", description="Third", priority=Priority.MEDIUM
        )
        task3.id = uuid4()
        task3.mark_as_done()

        # Repository returns tasks in this specific order
        tasks_in_order = [task1, task2, task3]

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = tasks_in_order

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 3
        assert result[0].title == "First Done"
        assert result[1].title == "Second Done"
        assert result[2].title == "Third Done"
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_tasks_large_dataset(self):
        """Test retrieving a large number of tasks by status"""
        # Create 50 done tasks
        done_tasks = []
        for i in range(50):
            task = Task.create(
                title=f"Done Task {i + 1}",
                description=f"Done description {i + 1}",
                priority=Priority.MEDIUM,
            )
            task.id = uuid4()
            task.mark_as_done()
            done_tasks.append(task)

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = done_tasks

        handler = GetTasksByStatusHandler(mock_repository)
        query = GetTasksByStatusQuery(is_done=True, is_archived=False)

        result = await handler.handle(query)

        assert len(result) == 50
        assert all(task.is_done for task in result)
        assert all(not task.is_archived for task in result)
        mock_repository.get_by_status.assert_called_once_with(True, False)

    @pytest.mark.asyncio
    async def test_get_tasks_query_object_immutability(self):
        """Test that the query object is not modified during handling"""
        original_is_done = True
        original_is_archived = False
        query = GetTasksByStatusQuery(
            is_done=original_is_done, is_archived=original_is_archived
        )

        mock_repository = AsyncMock()
        mock_repository.get_by_status.return_value = []

        handler = GetTasksByStatusHandler(mock_repository)

        # Handle the query
        await handler.handle(query)

        # Query should remain unchanged
        assert query.is_done == original_is_done
        assert query.is_archived == original_is_archived
        mock_repository.get_by_status.assert_called_once_with(
            original_is_done, original_is_archived
        )

    @pytest.mark.asyncio
    async def test_get_tasks_correct_delegation(self):
        """Test that handler correctly delegates to repository with exact parameters"""
        test_cases = [
            (False, False),
            (True, False),
            (True, True),
        ]

        for is_done, is_archived in test_cases:
            mock_repository = AsyncMock()
            mock_repository.get_by_status.return_value = []

            handler = GetTasksByStatusHandler(mock_repository)
            query = GetTasksByStatusQuery(is_done=is_done, is_archived=is_archived)

            await handler.handle(query)

            # Verify exact parameters were passed
            mock_repository.get_by_status.assert_called_once_with(is_done, is_archived)
