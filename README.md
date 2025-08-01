# GenAI Dashboard

This application is a playground for using and managing GenAI experiments. The first use case is working on the Top 100 Books of the Century as fodder for creating summaries and being an initial set of entities. The project expects to grow into performing arbitrary acts on arbitrary entities, or groups of entities. In practice it will be generations of relatively specific operations, as they may be more complicated than can be generalized in a UI with any utility. It also focuses on finding and visualizing relationships between entities.

It also showcases the use of Spring AI and other related technologies.

## Features

- **Chat Interface**: Interact with AI models through a user-friendly chat interface
- **Model Management**: Add, configure, and manage different AI models (OpenAI, Anthropic, etc.)
- **Book Catalog**: View and manage a collection of ranked books
- **AI-Generated Summaries**: Generate and store AI summaries for books using different models and configurations
- **Visualization**: Explore relationships between books and summaries with an interactive graph
- **Batch Processing**: Process multiple books in parallel for efficient summary generation

## Technology Stack

### Backend
- Java 21 with Eclipse Temurin JDK
- Spring Boot 3.4.4
- Spring AI 1.0.0
- PostgreSQL 16
- Hibernate/JPA
- Maven 3.9.6
- Docker containerized with hot reload

### Frontend
- Next.js 15.3.2
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls
- Cytoscape.js for graph visualization
- Docker containerized with hot reload

## Prerequisites

**For Make setup (Recommended):**
- Docker and Docker Compose
- Make (see installation instructions below)
- OpenAI API key

**For manual setup:**
- Java 21 or higher
- Node.js 20+ and npm  
- PostgreSQL 16+
- Docker and Docker Compose
- OpenAI API key

## Quick Start

### Using Make (Recommended)

**Install Make:**
- **macOS**: `brew install make` or use Xcode Command Line Tools
- **Windows**: `choco install make` or use WSL/Git Bash

```bash
# Start everything (interactive .env setup if needed)
make start

# Start with live logs
make start-watch

# Stop all services
make stop

# Reset database
make reset-db

# View all commands
make help
```

Access URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- pgAdmin: http://localhost:8081
- PostgreSQL: localhost:5433

### Manual Setup (Alternative)

1. Clone and create `.env` file (see `.env.example`)
2. Start services: `cd docker && docker-compose up`

## Project Structure

```
genai-playground/
├── Makefile                 # Project management commands
├── .env.example             # Environment variables template
├── backend/                 # Spring Boot backend
│   ├── src/                 # Source code
│   │   ├── main/
│   │   │   ├── java/        # Java code
│   │   │   └── resources/   # Configuration files
│   │   └── test/            # Test code
│   └── pom.xml              # Maven dependencies
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Container orchestration
│   ├── backend/             # Backend Docker setup
│   ├── frontend/            # Frontend Docker setup
│   └── postgres/            # PostgreSQL setup
│       └── init/            # Database initialization scripts
```

## Development

The project uses Docker Compose to orchestrate:
- **PostgreSQL** database with initialization scripts
- **pgAdmin** for database management
- **Spring Boot backend** with Maven and Temurin 21
- **Next.js frontend** with Node.js 20 and hot reloading

All services are containerized and configured for development with live code reloading.
