# GenAI Playground Makefile
# Provides easy commands to manage the Docker-based development environment

.PHONY: help start start-watch stop build reset-db clean setup-env logs

# Default target
help: ## Show this help message
	@echo "GenAI Playground - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Check if .env file exists, create it if not
setup-env: ## Check for .env file and create it from user input if missing
	@if [ ! -f .env ]; then \
		echo "🔧 .env file not found. Let's create one..."; \
		echo ""; \
		echo "# OpenAI API Configuration" > .env; \
		read -p "Enter your OpenAI API Key [your_openai_api_key_here]: " openai_key; \
		openai_key=$${openai_key:-your_openai_api_key_here}; \
		echo "OPENAI_API_KEY=$$openai_key" >> .env; \
		echo "" >> .env; \
		echo "# Database Configuration" >> .env; \
		read -p "Enter PostgreSQL server [localhost]: " postgres_server; \
		postgres_server=$${postgres_server:-localhost}; \
		echo "POSTGRES_SERVER=$$postgres_server" >> .env; \
		read -p "Enter PostgreSQL port [5433]: " postgres_port; \
		postgres_port=$${postgres_port:-5433}; \
		echo "POSTGRES_PORT=$$postgres_port" >> .env; \
		read -p "Enter PostgreSQL admin password [postgres]: " postgres_admin_pwd; \
		postgres_admin_pwd=$${postgres_admin_pwd:-postgres}; \
		echo "POSTGRES_ADMIN_PASSWORD=$$postgres_admin_pwd" >> .env; \
		read -p "Enter PostgreSQL app username [genai]: " postgres_app_user; \
		postgres_app_user=$${postgres_app_user:-genai}; \
		echo "POSTGRES_APP_USERNAME=$$postgres_app_user" >> .env; \
		read -p "Enter PostgreSQL app password [genai]: " postgres_app_pwd; \
		postgres_app_pwd=$${postgres_app_pwd:-genai}; \
		echo "POSTGRES_APP_PASSWORD=$$postgres_app_pwd" >> .env; \
		read -p "Enter application database name [playground]: " app_database; \
		app_database=$${app_database:-playground}; \
		echo "APP_DATABASE=$$app_database" >> .env; \
		echo "" >> .env; \
		echo "# pgAdmin Configuration" >> .env; \
		read -p "Enter pgAdmin default email [admin@example.com]: " pgadmin_email; \
		pgadmin_email=$${pgadmin_email:-admin@example.com}; \
		echo "PGADMIN_DEFAULT_EMAIL=$$pgadmin_email" >> .env; \
		read -p "Enter pgAdmin default password [admin]: " pgadmin_pwd; \
		pgadmin_pwd=$${pgadmin_pwd:-admin}; \
		echo "PGADMIN_DEFAULT_PASSWORD=$$pgadmin_pwd" >> .env; \
		echo "" >> .env; \
		echo "# Next.js Frontend Configuration" >> .env; \
		read -p "Enter frontend API URL [http://localhost:8080]: " api_url; \
		api_url=$${api_url:-http://localhost:8080}; \
		echo "NEXT_PUBLIC_API_URL=$$api_url" >> .env; \
		echo ""; \
		echo "✅ .env file created successfully!"; \
	else \
		echo "✅ .env file already exists."; \
	fi

# Start the development environment
start: setup-env ## Start the complete development environment (database + backend + frontend)
	@echo "🚀 Starting GenAI Playground development environment..."
	@cd docker && docker-compose up --build -d
	@echo "✅ Services started successfully!"
	@echo ""
	@echo "🔗 Access URLs:"
	@echo "  📱 Frontend:    http://localhost:3000"
	@echo "  🔧 Backend API: http://localhost:8080"
	@echo "  🗄️  pgAdmin:     http://localhost:8081"
	@echo "  🐘 PostgreSQL:  localhost:5433"
	@echo ""
	@echo "📋 Useful commands:"
	@echo "  make logs       - View all service logs"
	@echo "  make status     - Check service status"
	@echo "  make stop       - Stop all services"

# Start with logs (attached mode)
start-watch: setup-env ## Start the development environment and watch logs
	@echo "🚀 Starting GenAI Playground with live logs..."
	@cd docker && docker-compose up --build

# Stop the development environment
stop: ## Stop all running services
	@echo "🛑 Stopping GenAI Playground services..."
	@cd docker && docker-compose down

# Build/rebuild all services
build: setup-env ## Build or rebuild all Docker services
	@echo "🔨 Building GenAI Playground services..."
	@cd docker && docker-compose build

# Reset the database (removes data and recreates)
reset-db: ## Reset the database by removing volumes and restarting
	@echo "⚠️  WARNING: This will DELETE ALL database data!"
	@read -p "Are you sure you want to continue? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🗑️  Stopping services and removing database volumes..."; \
		cd docker && docker-compose down -v; \
		docker volume rm genai-postgres-data 2>/dev/null || true; \
		docker volume rm genai-pgadmin-data 2>/dev/null || true; \
		echo "🔄 Restarting services with fresh database..."; \
		docker-compose up --build -d postgres; \
		echo "✅ Database reset complete!"; \
	else \
		echo "❌ Database reset cancelled."; \
	fi

# View logs
logs: ## View logs from all services
	@cd docker && docker-compose logs -f

# View logs for a specific service
logs-backend: ## View backend service logs
	@cd docker && docker-compose logs -f backend

logs-frontend: ## View frontend service logs
	@cd docker && docker-compose logs -f frontend

logs-db: ## View database service logs
	@cd docker && docker-compose logs -f postgres

# Clean up everything (containers, images, volumes)
clean: ## Remove all containers, images, and volumes (nuclear option)
	@echo "⚠️  WARNING: This will remove ALL Docker containers, images, and volumes for this project!"
	@read -p "Are you sure you want to continue? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🧹 Cleaning up Docker resources..."; \
		cd docker && docker-compose down -v --rmi all --remove-orphans; \
		docker system prune -f; \
		echo "✅ Cleanup complete!"; \
	else \
		echo "❌ Cleanup cancelled."; \
	fi

# Development helpers
dev-backend: setup-env ## Start only backend and database services
	@echo "🔧 Starting backend development environment..."
	@cd docker && docker-compose up --build backend

dev-frontend: ## Start only frontend service
	@echo "📱 Starting frontend development environment..."
	@cd docker && docker-compose up --build frontend

# Health check
status: ## Show status of all services
	@echo "📊 GenAI Playground Service Status:"
	@cd docker && docker-compose ps