.PHONY: help install dev build up down logs clean

# Default target
help:
	@echo "Natural Language to PromQL - Available Commands"
	@echo ""
	@echo "  make install        Install dependencies for backend and frontend"
	@echo "  make dev           Run backend and frontend in development mode"
	@echo "  make build         Build Docker images"
	@echo "  make up            Start all services with Docker Compose"
	@echo "  make up-grafana    Start all services including Grafana"
	@echo "  make down          Stop all services"
	@echo "  make logs          View logs from all services"
	@echo "  make clean         Remove containers, volumes, and images"
	@echo "  make test          Run tests"
	@echo ""

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed successfully!"

# Development mode (local)
dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:4000"
	@echo "Frontend will run on http://localhost:5173"
	@echo ""
	@echo "Open two terminal windows and run:"
	@echo "  Terminal 1: cd backend && npm run dev"
	@echo "  Terminal 2: cd frontend && npm run dev"

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services (without Grafana)
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started!"
	@echo "  - Prometheus: http://localhost:9090"
	@echo "  - Backend API: http://localhost:4000"
	@echo "  - Frontend: http://localhost"

# Start services (with Grafana)
up-grafana:
	@echo "Starting services with Grafana..."
	docker-compose --profile with-grafana up -d
	@echo "Services started!"
	@echo "  - Prometheus: http://localhost:9090"
	@echo "  - Backend API: http://localhost:4000"
	@echo "  - Frontend: http://localhost"
	@echo "  - Grafana: http://localhost:3000 (admin/admin)"

# Stop services
down:
	@echo "Stopping services..."
	docker-compose --profile with-grafana down
	@echo "Services stopped!"

# View logs
logs:
	docker-compose --profile with-grafana logs -f

# Clean up everything
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose --profile with-grafana down -v --rmi all
	@echo "Cleanup complete!"

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

