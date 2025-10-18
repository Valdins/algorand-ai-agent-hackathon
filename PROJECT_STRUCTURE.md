# Project Structure

## Overview

This document describes the professional, modular structure of the Algorand AI Agent project.

## Directory Tree

```
algorand-ai-agent-hackathon/
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main_new.py               # Main FastAPI application (NEW)
│   │   ├── main.py                    # Legacy main file (deprecated)
│   │   ├── api/                       # API routes
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── endpoints.py       # API endpoints
│   │   ├── core/                      # Core utilities
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Configuration management
│   │   │   └── logging.py             # Logging setup
│   │   ├── models/                    # Data models
│   │   │   ├── __init__.py
│   │   │   └── task.py                # Task model
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── task.py                # Request/Response schemas
│   │   └── services/                  # Business logic
│   │       ├── __init__.py
│   │       ├── task_manager.py        # Task management service
│   │       └── agent_executor.py      # Agent execution service
│   ├── requirements.txt
│   └── Dockerfile
│
├── agent-runner/                      # AI Agent System
│   ├── src/                           # Source code (NEW)
│   │   ├── __init__.py
│   │   ├── main.py                    # Entry point
│   │   ├── core/                      # Core utilities
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Configuration
│   │   │   └── logger.py              # Logging utilities
│   │   ├── tools/                     # Agent tools
│   │   │   ├── __init__.py
│   │   │   ├── shell.py               # Shell execution tool
│   │   │   ├── file_ops.py            # File operation tools
│   │   │   └── documentation.py       # RAG search tool
│   │   └── runner/                    # Agent runner
│   │       ├── __init__.py
│   │       └── engine.py              # Agent execution engine
│   ├── runner.py                      # Legacy runner (still used internally)
│   ├── docs/
│   │   └── algokit_guide.md           # AlgoKit documentation for RAG
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                          # Angular Frontend
│   └── algorand-ai-agent/
│       ├── src/
│       │   └── app/
│       │       └── app.component.ts   # Main UI component
│       └── package.json
│
├── docker-compose.yml                 # Docker Compose configuration
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── README.md                          # Main documentation
├── CLAUDE.md                          # AI assistant guidance
├── IMPLEMENTATION.md                  # Implementation details
├── PROJECT_STRUCTURE.md               # This file
├── setup.sh                           # Linux/Mac setup script
└── setup.bat                          # Windows setup script
```

## Backend Structure (New Organization)

### `app/main_new.py`
- **Main FastAPI application**
- Configures CORS, routes, and middleware
- Startup/shutdown event handlers
- Application entry point

### `app/api/v1/endpoints.py`
- **API route handlers**
- `/health` - Health check
- `/generate` - Create smart contract generation task
- `/status/{task_id}` - Get task status
- `/tasks` - List all tasks
- DELETE `/tasks/{task_id}` - Delete task

### `app/core/`
- **Configuration and utilities**
- `config.py` - Pydantic Settings for configuration management
- `logging.py` - Centralized logging setup

### `app/models/`
- **Domain models**
- `task.py` - Task model with status enum and methods

### `app/schemas/`
- **Pydantic schemas for API**
- `task.py` - Request/response models with examples

### `app/services/`
- **Business logic services**
- `task_manager.py` - Thread-safe task storage and retrieval
- `agent_executor.py` - Docker container execution and output processing

## Agent Runner Structure (New Organization)

### `src/main.py`
- **Entry point** for agent runner
- Parses command-line arguments
- Calls runner engine
- Prints final result

### `src/core/`
- **Core utilities**
- `config.py` - Configuration from environment variables
- `logger.py` - Timestamped logging utility

### `src/tools/`
- **Agent tools (smol-agents @tool decorated)**
- `shell.py` - Execute shell commands
- `file_ops.py` - Read/write files
- `documentation.py` - RAG search in AlgoKit docs

### `src/runner/`
- **Agent execution engine**
- `engine.py` - Wrapper for AlgorandAgentSystem
- Imports from `runner.py` (legacy) to maintain compatibility

### `runner.py` (Legacy)
- **Original runner implementation**
- Contains AlgorandAgentSystem class
- Still used internally but wrapped by new structure

## Key Design Patterns

### Backend

1. **Separation of Concerns**
   - Routes (API) → Services (Logic) → Models (Data)
   - Clear boundaries between layers

2. **Configuration Management**
   - Pydantic Settings for type-safe config
   - Environment variable loading with defaults
   - Single source of truth for settings

3. **Dependency Injection**
   - Global service instances (task_manager, agent_executor)
   - Easy to test and mock

4. **API Versioning**
   - Routes under `/api/v1/`
   - Future v2 can coexist

### Agent Runner

1. **Modular Tools**
   - Each tool in separate file
   - All tools exported from `__init__.py`
   - Easy to add new tools

2. **Configuration as Code**
   - Config class with sensible defaults
   - Environment-aware

3. **Wrapper Pattern**
   - New structure wraps existing logic
   - Maintains compatibility
   - Easier to refactor incrementally

## Migration Notes

### Using the New Backend

The new backend is located in `app/main_new.py`. To use it:

1. **Local development**:
   ```bash
   cd backend
   uvicorn app.main_new:app --reload
   ```

2. **Docker** (already configured):
   ```bash
   docker compose up --build
   ```

### Using the New Agent Runner

The new entry point is `src/main.py`:

1. **Direct execution**:
   ```bash
   python src/main.py --prompt "Create a counter contract"
   ```

2. **Docker** (already configured):
   - Dockerfile uses `ENTRYPOINT ["python", "/app/src/main.py"]`

## Benefits of New Structure

### Backend

✅ **Professional organization** - Clear folder structure
✅ **Type safety** - Pydantic schemas and models
✅ **Separation of concerns** - Routes, services, models
✅ **Easy testing** - Modular services
✅ **Maintainability** - Code is organized by functionality
✅ **Scalability** - Easy to add new endpoints/services

### Agent Runner

✅ **Modular tools** - Easy to add/modify agent capabilities
✅ **Clean imports** - No circular dependencies
✅ **Configuration management** - Centralized config
✅ **Maintainability** - Separated concerns
✅ **Extensibility** - Easy to add new agents

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API information |
| GET | `/api/health` | Health check |
| POST | `/api/generate` | Create generation task |
| GET | `/api/status/{task_id}` | Get task status |
| GET | `/api/tasks` | List all tasks |
| DELETE | `/api/tasks/{task_id}` | Delete task |
| GET | `/docs` | OpenAPI documentation |
| GET | `/redoc` | ReDoc documentation |

## Configuration

### Backend (app/core/config.py)

- `APP_NAME` - Application name
- `APP_VERSION` - API version
- `API_V1_PREFIX` - API prefix path
- `CORS_ORIGINS` - CORS allowed origins
- `AGENT_IMAGE` - Docker image for agents
- `DOCKER_NETWORK` - Docker network name
- `AZURE_OPENAI_*` - Azure OpenAI credentials
- `ALGOD_SERVER` - Algorand node address

### Agent Runner (src/core/config.py)

- `WORKSPACE_DIR` - Working directory for agents
- `AZURE_OPENAI_*` - LLM credentials
- `ALGOD_SERVER` - Algorand connection
- `DOCS_DIR` - Documentation path for RAG

## Testing the New Structure

### Backend

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Create task
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a counter contract"}'

# Get status
curl http://localhost:8000/api/status/{task_id}

# List tasks
curl http://localhost:8000/api/tasks
```

### Agent Runner

```bash
# Run directly
cd agent-runner
python src/main.py --prompt "Create a simple contract"

# Or via Docker
docker run --rm agent-runner:latest --prompt "Create a simple contract"
```

## Future Improvements

1. **Database Integration** - Replace in-memory task storage with PostgreSQL
2. **Async Task Queue** - Use Celery/Redis for task management
3. **Unit Tests** - Add pytest tests for services
4. **API Authentication** - Add JWT/OAuth support
5. **Rate Limiting** - Add request rate limiting
6. **Metrics** - Add Prometheus metrics
7. **Agent Agents** - Split AlgorandAgentSystem into separate agent classes

## Legacy Files

The following files are kept for compatibility but are deprecated:

- `backend/app/main.py` - Use `main_new.py` instead
- `agent-runner/runner.py` - Wrapped by new structure

These will be removed in a future version once migration is complete.
