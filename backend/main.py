from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.infrastructure.database import database
from src.presentation.api import task_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.create_tables()
    yield
    await database.close()


app = FastAPI(
    title="Todo API",
    description="A Todo List API with Clean Architecture and DDD",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router)


@app.get("/")
async def root():
    return {"message": "Todo API is running"}