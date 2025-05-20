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
- Java 21
- Spring Boot 3.4.4
- Spring AI 1.0.0-M8
- PostgreSQL
- Hibernate/JPA
- Maven

### Frontend
- React with React Router
- Next.js (alternative frontend implementation)
- Tailwind CSS
- Axios
- Cytoscape.js for graph visualization

## Prerequisites

- Java 21 or higher
- Node.js 14+ and npm
- PostgreSQL 15+
- Docker and Docker Compose
- OpenAI API key or other AI model provider credentials

## Setup and Installation

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/genai-playground.git
   cd genai-dashboard
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   POSTGRES_ADMIN_PASSWORD=your_postgres_admin_password
   POSTGRES_APP_USER=genai
   POSTGRES_APP_PASSWORD=genai
   APP_DATABASE=playground
   ```

### Database Setup

Start the PostgreSQL container:

```bash
cd docker
docker-compose up -d
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   ./run.sh spring-boot:run
   ```

   Alternatively, you can use:
   ```bash
   ./mvnw clean package
   java -jar target/genai-0.0.1-SNAPSHOT.jar
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## Project Structure

```
genai-dashboard/
├── backend/                 # Spring Boot backend
│   ├── src/                 # Source code
│   │   ├── main/
│   │   │   ├── java/        # Java code
│   │   │   └── resources/   # Configuration files
│   │   └── test/            # Test code
│   └── pom.xml              # Maven dependencies
├── frontend/                # Next.js frontend
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Container orchestration
│   └── postgres/            # PostgreSQL setup
│       └── init/            # Database initialization scripts
```
