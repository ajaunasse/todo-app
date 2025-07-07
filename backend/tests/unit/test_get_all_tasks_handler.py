from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.application.handlers import GetAllTasksHandler
from src.application.queries import GetAllTasksQuery
from src.domain.entities import Priority, Task


class TestGetAllTasksHandler:
    @pytest.mark.asyncio
    async def test_get_all_tasks_success(self):
        """Test successfully retrieving all tasks"""
        task1 = Task.create(
            title="Task 1", description="First task", priority=Priority.HIGH
        )
        task1.id = uuid4()

        task2 = Task.create(
            title="Task 2", description="Second task", priority=Priority.MEDIUM
        )
        task2.id = uuid4()
        task2.mark_as_done()  # Mark second task as done

        task3 = Task.create(
            title="Task 3", description="Third task", priority=Priority.LOW
        )
        task3.id = uuid4()
        task3.mark_as_done()  # Mark as done
        task3.archive()  # Then archive

        expected_tasks = [task1, task2, task3]

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = expected_tasks

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 3
        assert result[0].title == "Task 1"
        assert result[0].is_done is False
        assert result[0].is_archived is False
        assert result[1].title == "Task 2"
        assert result[1].is_done is True
        assert result[1].is_archived is False
        assert result[2].title == "Task 3"
        assert result[2].is_done is True
        assert result[2].is_archived is True
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_empty_list(self):
        """Test retrieving all tasks when no tasks exist"""
        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = []

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert result == []
        assert len(result) == 0
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_single_task(self):
        """Test retrieving all tasks with only one task"""
        task = Task.create(
            title="Single Task", description="Only task", priority=Priority.MEDIUM
        )
        task.id = uuid4()

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = [task]

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 1
        assert result[0].title == "Single Task"
        assert result[0].description == "Only task"
        assert result[0].priority == Priority.MEDIUM
        assert result[0].is_done is False
        assert result[0].is_archived is False
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_mixed_priorities(self):
        """Test retrieving tasks with different priorities"""
        low_task = Task.create(
            title="Low Priority", description="Low priority task", priority=Priority.LOW
        )
        low_task.id = uuid4()

        medium_task = Task.create(
            title="Medium Priority",
            description="Medium priority task",
            priority=Priority.MEDIUM,
        )
        medium_task.id = uuid4()

        high_task = Task.create(
            title="High Priority",
            description="High priority task",
            priority=Priority.HIGH,
        )
        high_task.id = uuid4()

        tasks = [low_task, medium_task, high_task]

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = tasks

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 3
        priorities = [task.priority for task in result]
        assert Priority.LOW in priorities
        assert Priority.MEDIUM in priorities
        assert Priority.HIGH in priorities
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_mixed_statuses(self):
        """Test retrieving tasks with different statuses"""
        pending_task = Task.create(
            title="Pending Task", description="Still pending", priority=Priority.LOW
        )
        pending_task.id = uuid4()

        done_task = Task.create(
            title="Done Task", description="Completed task", priority=Priority.MEDIUM
        )
        done_task.id = uuid4()
        done_task.mark_as_done()

        archived_task = Task.create(
            title="Archived Task", description="Archived task", priority=Priority.HIGH
        )
        archived_task.id = uuid4()
        archived_task.mark_as_done()
        archived_task.archive()

        tasks = [pending_task, done_task, archived_task]

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = tasks

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 3

        # Check pending task
        pending = next(task for task in result if task.title == "Pending Task")
        assert pending.is_done is False
        assert pending.is_archived is False

        # Check done task
        done = next(task for task in result if task.title == "Done Task")
        assert done.is_done is True
        assert done.is_archived is False

        # Check archived task
        archived = next(task for task in result if task.title == "Archived Task")
        assert archived.is_done is True
        assert archived.is_archived is True

        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_repository_error(self):
        """Test handling repository error when getting all tasks"""
        mock_repository = AsyncMock()
        mock_repository.get_all.side_effect = Exception("Database connection error")

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        with pytest.raises(Exception, match="Database connection error"):
            await handler.handle(query)

        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_preserves_order(self):
        """Test that get all tasks preserves the order returned by repository"""
        task1 = Task.create(
            title="First", description="First task", priority=Priority.LOW
        )
        task1.id = uuid4()

        task2 = Task.create(
            title="Second", description="Second task", priority=Priority.HIGH
        )
        task2.id = uuid4()

        task3 = Task.create(
            title="Third", description="Third task", priority=Priority.MEDIUM
        )
        task3.id = uuid4()

        # Repository returns tasks in this specific order
        tasks_in_order = [task1, task2, task3]

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = tasks_in_order

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 3
        assert result[0].title == "First"
        assert result[1].title == "Second"
        assert result[2].title == "Third"
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_large_dataset(self):
        """Test retrieving a large number of tasks"""
        # Create 100 tasks
        tasks = []
        for i in range(100):
            task = Task.create(
                title=f"Task {i + 1}",
                description=f"Description {i + 1}",
                priority=Priority.MEDIUM,
            )
            task.id = uuid4()
            if i % 2 == 0:  # Mark even-numbered tasks as done
                task.mark_as_done()
            if i % 10 == 0 and i > 0:  # Archive every 10th task (but not the first)
                task.archive()
            tasks.append(task)

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = tasks

        handler = GetAllTasksHandler(mock_repository)
        query = GetAllTasksQuery()

        result = await handler.handle(query)

        assert len(result) == 100

        # Check that we have the expected distribution
        pending_count = sum(1 for task in result if not task.is_done)
        done_count = sum(1 for task in result if task.is_done and not task.is_archived)
        archived_count = sum(1 for task in result if task.is_archived)

        assert pending_count == 50  # Odd-numbered tasks (1, 3, 5, ..., 99)
        assert done_count == 41  # Even-numbered tasks that aren't archived
        assert archived_count == 9  # Tasks 10, 20, 30, ..., 90

        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_tasks_query_object_immutability(self):
        """Test that the query object is not modified during handling"""
        original_query = GetAllTasksQuery()

        mock_repository = AsyncMock()
        mock_repository.get_all.return_value = []

        handler = GetAllTasksHandler(mock_repository)

        # Handle the query
        await handler.handle(original_query)

        # Query should remain unchanged (it's a simple dataclass with no fields)
        assert isinstance(original_query, GetAllTasksQuery)
        mock_repository.get_all.assert_called_once()
