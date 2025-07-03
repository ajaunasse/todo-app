from datetime import datetime

from src.domain.entities import Priority, Task


class TestTaskEntity:
    def test_create_task(self):
        task = Task.create(
            title="Test Task", description="Test Description", priority=Priority.HIGH
        )

        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.priority == Priority.HIGH
        assert task.is_done is False
        assert isinstance(task.created_at, datetime)
        assert isinstance(task.updated_at, datetime)

    def test_mark_as_done(self):
        task = Task.create(title="Test Task", description="Test Description", priority=Priority.LOW)

        original_updated_at = task.updated_at
        task.mark_as_done()

        assert task.is_done is True
        assert task.updated_at > original_updated_at

    def test_mark_as_pending(self):
        task = Task.create(title="Test Task", description="Test Description", priority=Priority.LOW)
        task.mark_as_done()
        assert task.is_done is True

        original_updated_at = task.updated_at
        import time
        time.sleep(0.001)  # Small delay to ensure timestamp difference
        task.mark_as_pending()

        assert task.is_done is False
        assert task.updated_at > original_updated_at

    def test_update_task(self):
        task = Task.create(
            title="Original Title", description="Original Description", priority=Priority.LOW
        )

        original_updated_at = task.updated_at

        task.update(title="Updated Title", priority=Priority.HIGH)

        assert task.title == "Updated Title"
        assert task.description == "Original Description"
        assert task.priority == Priority.HIGH
        assert task.updated_at > original_updated_at
