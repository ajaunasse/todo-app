.PHONY: help build start stop restart clean test lint format install install-local dev logs backend-logs frontend-logs backend-test frontend-test backend-lint backend-format frontend-lint frontend-format backend-install frontend-install backend-dev frontend-dev backend-install-local backend-dev-local backend-test-local backend-lint-local backend-format-local check-deps status quick-start ci-test ci-lint db-reset local-sync

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker commands
build: ## Build all Docker containers
	docker-compose build

start: ## Start all services with Docker Compose
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

clean: ## Stop and remove all containers, networks, and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

# 📦 Manage local Python virtual environment
local-sync: ## Create/sync local Python venv for backend
	cd backend && uv venv && uv sync

logs: ## Show logs for all services
	docker-compose logs -f

backend-logs: ## Show logs for backend service only
	docker-compose logs -f backend

frontend-logs: ## Show logs for frontend service only
	docker-compose logs -f frontend

# Backend commands in container (requires container to be running)
backend-test: ## Run backend tests in container
	docker-compose exec backend uv run python -m pytest tests/ -v

backend-lint: ## Lint backend code in container
	docker-compose exec backend uv run ruff check src/ tests/

backend-format: ## Format backend code in container
	docker-compose exec backend uv run ruff format src/ tests/
	docker-compose exec backend uv run ruff check src/ tests/ --fix

backend-format-check: ## Check if backend code is formatted in container
	docker-compose exec backend uv run ruff format src/ tests/ --check

# Local backend commands (for development without Docker)
backend-install-local: ## Install backend dependencies locally
	cd backend && uv sync

backend-dev-local: ## Start backend development server locally
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

backend-test-local: ## Run backend tests locally
	cd backend && uv run python -m pytest tests/ -v

backend-lint-local: ## Lint backend code locally
	cd backend && uv run ruff check src/ tests/

backend-format-local: ## Format backend code locally
	cd backend && uv run ruff format src/ tests/
	cd backend && uv run ruff check src/ tests/ --fix

# Frontend commands
frontend-install: ## Install frontend dependencies locally
	cd frontend && npm install

frontend-dev: ## Start frontend development server locally
	cd frontend && npm start

frontend-build: ## Build frontend for production
	cd frontend && npm run build

frontend-test: ## Run frontend tests
	cd frontend && npm test -- --watchAll=false

frontend-test-watch: ## Run frontend tests in watch mode
	cd frontend && npm test

frontend-lint: ## Lint frontend code
	cd frontend && npm run lint

frontend-lint-fix: ## Lint and fix frontend code
	cd frontend && npm run lint:fix

frontend-format: ## Format frontend code
	cd frontend && npm run format

frontend-format-check: ## Check if frontend code is formatted
	cd frontend && npm run format:check

frontend-type-check: ## Type check frontend code
	cd frontend && npm run type-check

# Combined commands
install: build frontend-install ## Install all dependencies (build containers, install frontend locally)

install-local: check-local-deps backend-install-local frontend-install ## Install all dependencies locally

test: backend-test frontend-test ## Run all tests

lint: backend-lint frontend-lint ## Lint all code

lint-fix: backend-format frontend-lint-fix ## Lint and fix all code

format: backend-format frontend-format ## Format all code

format-check: backend-format-check frontend-format-check ## Check if all code is formatted

type-check: frontend-type-check ## Type check all code

# Database commands
db-reset: ## Reset database (remove volume and restart)
	docker-compose down -v
	docker-compose up -d backend

# Utility commands
check-deps: ## Check if required tools are installed
	@echo "Checking required dependencies..."
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }
	@echo "✅ Docker and Docker Compose are installed"
	@command -v uv >/dev/null 2>&1 || echo "⚠️  uv not found (optional for local development)"
	@command -v node >/dev/null 2>&1 || echo "⚠️  Node.js not found (optional for local development)"
	@echo "✅ Dependency check complete"

check-local-deps: ## Check if required tools are installed for local development (uv, node, npm)
	@echo "Checking required dependencies for local development..."
	@command -v uv >/dev/null 2>&1 || { echo "❌ uv is required for local backend development but not installed."; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required for local frontend development but not installed."; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "❌ npm is required for local frontend development but not installed."; exit 1; }
	@echo "✅ uv, Node.js, and npm are installed"

status: ## Show status of all services
	docker-compose ps

# Quick start commands
quick-start: check-deps build start ## Quick start: check deps, build, and start all services
	@echo "🚀 Application started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# CI/CD commands
ci-test: ## Run all tests for CI/CD
	docker-compose -f docker-compose.yml run --rm backend uv run python -m pytest tests/ -v
	docker-compose -f docker-compose.yml run --rm frontend npm test -- --watchAll=false

ci-lint: ## Run all linting for CI/CD
	docker-compose -f docker-compose.yml run --rm backend uv run ruff check src/ tests/
	docker-compose -f docker-compose.yml run --rm backend uv run ruff format src/ tests/ --check
	docker-compose -f docker-compose.yml run --rm frontend npm run lint
	docker-compose -f docker-compose.yml run --rm frontend npm run format:check
	docker-compose -f docker-compose.yml run --rm frontend npm run type-check