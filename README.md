# Todo List Application

A full-stack Todo List application built with FastAPI (backend) and React with TypeScript (frontend), following Clean Architecture and Domain-Driven Design principles.

## Features

### Functional Requirements
- ✅ Create tasks with title, description, and priority (low, medium, high)
- ✅ Modify existing tasks
- ✅ List tasks sorted by descending priority
- ✅ Limit of 5 tasks with "high" priority (with clear error message)
- ✅ Mark tasks as done
- ✅ View completed tasks in separate tab/filter
- ✅ Filter tasks by status (done, not done)
- ✅ Drag and drop task from pending to done
- ✅ Archive completed tasks with success notifications
- ✅ Edit disabled for completed tasks
- ✅ Task count statistics (pending, done, archived)

### Technical Requirements
- ✅ **Backend**: FastAPI with Clean Architecture and DDD
- ✅ **Database**: SQLite
- ✅ **Command Pattern**: CreateTaskCommand, ModifyTaskCommand, etc.
- ✅ **Testing**: Unit tests and functional tests
- ✅ **Frontend**: React with TypeScript
- ✅ **UI Architecture**: Atomic Design Pattern
- ✅ **State Management**: Zustand
- ✅ **Frontend Testing**: React Testing Library
- ✅ **Deployment**: Docker Compose
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Validation**: Pydantic schemas

## Project Structure

```
todo-app/
├── backend/                 # FastAPI backend (Clean Architecture)
│   ├── src/
│   │   ├── domain/         # Domain layer (entities, repositories)
│   │   ├── application/    # Application layer (commands, queries, handlers)
│   │   ├── infrastructure/ # Infrastructure layer (database, repositories)
│   │   └── presentation/   # Presentation layer (API, schemas)
│   ├── tests/              # Backend tests
│   └── main.py            # FastAPI application entry point
├── frontend/               # React frontend (Clean Architecture + Atomic Design)
│   ├── src/
│   │   ├── domain/        # Domain layer
│   │   │   ├── entities/  # Business entities (Task, Priority)
│   │   │   ├── repositories/ # Repository interfaces
│   │   │   └── usecases/  # Business use cases
│   │   ├── infrastructure/ # Infrastructure layer
│   │   │   ├── api/       # API clients
│   │   │   └── repositories/ # Repository implementations
│   │   ├── application/   # Application layer
│   │   │   ├── services/  # Business services
│   │   │   └── di/        # Dependency injection
│   │   ├── presentation/  # Presentation layer
│   │   │   ├── components/ # Atomic design components
│   │   │   │   ├── atoms/ # Basic UI elements
│   │   │   │   ├── molecules/ # Component combinations
│   │   │   │   └── organisms/ # Complex components
│   │   │   ├── pages/     # Application pages
│   │   │   └── hooks/     # Custom hooks
│   │   └── types/         # Legacy types (being phased out)
│   └── public/            # Static assets
├── Makefile               # Development commands
└── docker-compose.yml     # Docker deployment
```

## Quick Start

### Prerequisites
- Docker and Docker Compose if you are using Docker
- Node.js 18+ (for local development)
- Python 3.11+ with uv (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone git@github.com:ajaunasse/todo-app.git
cd todo-app
```

2. Quick start with Docker and Makefile:
```bash
make quick-start
```

Or manually:
```bash
make build
make start
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Available Make Commands

Run `make help` to see all available commands:

```bash
# Quick start
make quick-start          # Check deps, build, and start all services
make quick-dev            # Start development environment with logs

# Docker operations
make build                # Build all Docker containers
make start                # Start all services
make stop                 # Stop all services
make restart              # Restart all services
make clean                # Remove all containers and volumes

# Development
make dev                  # Start development environment
make logs                 # Show logs for all services
make backend-logs         # Show backend logs only
make frontend-logs        # Show frontend logs only

# Testing
make test                 # Run all tests
make backend-test         # Run backend tests only
make frontend-test        # Run frontend tests only

# Code quality
make lint                 # Lint all code
make lint-fix             # Lint and fix all code
make format               # Format all code
make format-check         # Check code formatting
make type-check           # Type check TypeScript

# Installation
make install              # Install all dependencies locally
make backend-install      # Install backend dependencies
make frontend-install     # Install frontend dependencies
```

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install uv (if not already installed):
```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with pip
pip install uv
```

3. Install dependencies using pyproject.toml:
```bash
uv sync
```

4. Activate the virtual environment:
```bash
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
```

5. Run the server:
```bash
uv run uvicorn main:app --reload
```

**Alternative: Without virtual environment activation**
```bash
uv run uvicorn main:app --reload
```

#### Development Tools

The backend includes modern Python tooling:

- **uv**: Fast Python package installer and dependency manager
- **ruff**: Fast Python linter and formatter
- **pytest**: Testing framework

Key dependencies are managed in `pyproject.toml`:
- FastAPI with Uvicorn for the web server
- SQLAlchemy for database ORM
- Pydantic for data validation
- Pytest for testing

Available Makefile commands for backend:
```bash
make backend-dev          # Start local development server
make backend-test         # Run tests
make backend-lint         # Lint code
make backend-format       # Format code
make backend-install      # Install dependencies using uv sync
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Available Makefile commands for frontend:
```bash
make frontend-dev         # Start local development server
make frontend-test        # Run tests
make frontend-lint        # Lint code
make frontend-format      # Format code with Prettier
make frontend-type-check  # Type check TypeScript
make frontend-install     # Install dependencies
```

## Testing

### Using Makefile (Recommended)
```bash
make test                 # Run all tests
make backend-test         # Run backend tests only  
make frontend-test        # Run frontend tests only
make ci-test             # Run tests for CI/CD
```

### Manual Testing

#### Backend Tests
```bash
cd backend
# With virtual environment activated
pytest

# Or without activation using uv
uv run pytest
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## API Endpoints

- `GET /tasks/` - Get all tasks
- `POST /tasks/` - Create a new task
- `PUT /tasks/{task_id}` - Update a task
- `PATCH /tasks/{task_id}/done` - Mark task as done
- `PATCH /tasks/{task_id}/pending` - Mark task as pending
- `PATCH /tasks/{task_id}/archive` - Archive a completed task
- `GET /tasks/status/{is_done}` - Get tasks by status

## Architecture Overview

### Backend Architecture (Clean Architecture + DDD)

1. **Domain Layer**: Contains business entities and repository interfaces
2. **Application Layer**: Contains business logic, commands, queries, and handlers
3. **Infrastructure Layer**: Contains database implementation and external dependencies
4. **Presentation Layer**: Contains API endpoints and request/response schemas

### Frontend Architecture (Clean Architecture + Atomic Design)

#### Clean Architecture Layers:
1. **Domain Layer**: Contains business entities and repository interfaces
   - Entities: Task, Priority
   - Repository interfaces: TaskRepository
   - Use cases: CreateTask, UpdateTask, MarkTaskAsDone, MarkTaskAsPending, ArchiveTask, GetTasks, etc.

2. **Infrastructure Layer**: External concerns and implementations
   - API clients: TaskApiClient
   - Repository implementations: HttpTaskRepository

3. **Application Layer**: Business logic orchestration
   - Services: TaskService (business operations)
   - Dependency Injection: Container (service composition)

4. **Presentation Layer**: UI components and user interaction
   - **Atoms**: Basic UI components (Button, Input, Select)
   - **Molecules**: Simple component combinations (TaskCard, TaskForm)
   - **Organisms**: Complex components (TaskList, Header)
   - **Pages**: Complete page layouts
   - **Hooks**: Custom hooks for business logic (useTaskManagement)

## Archive Functionality

The application includes a comprehensive task archiving system:

### Features
- **Archive Completed Tasks**: Only completed (done) tasks can be archived
- **Smart UI Controls**: 
  - Archive button appears only for completed tasks
  - Edit button is disabled for completed tasks
  - Archive button positioned in the top-right with appropriate icon
- **Success Notifications**: 
  - Toast notification shows when task is archived successfully
  - Notification includes task title and auto-hides after 3 seconds
  - Manual dismiss option available
- **Task Filtering**: 
  - Archived tasks are hidden from both pending and done columns
  - Task counts exclude archived tasks from active counts
  - Separate archived count displayed in header statistics
- **Data Integrity**: 
  - Backend validation ensures only completed tasks can be archived
  - Proper error handling for invalid archive attempts
  - Clean architecture maintained across all layers

### Technical Implementation
- **Backend**: Archive command with domain validation
- **Frontend**: React state management with success notifications
- **Database**: SQLite with `is_archived` boolean field
- **Testing**: Comprehensive test coverage for all archive scenarios

### Usage
1. Complete a task by dragging to "Done" column or clicking done
2. Click the archive button (📦 icon) that appears for completed tasks
3. View success notification confirming the task was archived
4. Archived tasks are hidden from view but counted in statistics

This feature maintains the clean architecture principles while providing a polished user experience for task lifecycle management.