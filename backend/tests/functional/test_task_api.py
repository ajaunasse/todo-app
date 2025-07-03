import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from main import app
from src.infrastructure.database import Base
from src.presentation.api.task_router import get_db_session

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db_session] = override_get_db


@pytest.fixture
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
class TestTaskAPI:
    async def test_create_task(self, setup_database):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/tasks/",
                json={"title": "Test Task", "description": "Test Description", "priority": "high"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["title"] == "Test Task"
            assert data["description"] == "Test Description"
            assert data["priority"] == "high"
            assert data["is_done"] is False

    async def test_get_all_tasks(self, setup_database):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post(
                "/tasks/",
                json={"title": "Task 1", "description": "Description 1", "priority": "high"},
            )
            await client.post(
                "/tasks/",
                json={"title": "Task 2", "description": "Description 2", "priority": "low"},
            )

            response = await client.get("/tasks/")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2

    async def test_high_priority_limit(self, setup_database):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            for i in range(5):
                response = await client.post(
                    "/tasks/",
                    json={
                        "title": f"High Priority Task {i+1}",
                        "description": f"Description {i+1}",
                        "priority": "high",
                    },
                )
                assert response.status_code == 201

            response = await client.post(
                "/tasks/",
                json={
                    "title": "Sixth High Priority Task",
                    "description": "This should fail",
                    "priority": "high",
                },
            )

            assert response.status_code == 400
            assert "Cannot create more than 5 tasks with high priority" in response.json()["detail"]
