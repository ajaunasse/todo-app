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
- 

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
git clone <repository-url>
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

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. Install dependencies:
```bash
uv pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

#### Development Tools

The backend includes modern Python tooling:

- **uv**: Fast Python package installer
- **ruff**: Fast Python linter and formatter

Available Makefile commands for backend:
```bash
make backend-dev          # Start local development server
make backend-test         # Run tests
make backend-lint         # Lint code
make backend-format       # Format code
make backend-install      # Install dependencies
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
pytest
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
   - Use cases: CreateTask, UpdateTask, MarkTaskAsDone, GetTasks, etc.

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