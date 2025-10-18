# 🤖 Algorand AI Agent

> Generate and deploy Algorand smart contracts using natural language with AI-powered multi-agent system

## 📋 Overview

A full-stack application that enables users to generate and deploy Algorand smart contracts by simply describing their requirements in natural language. The system uses a multi-agent AI architecture powered by Azure OpenAI and smol-agents to handle the entire workflow from planning to deployment.

### Key Features

- 🎯 **Natural Language Input**: Describe your smart contract in plain English
- 🤖 **Multi-Agent System**: Specialized AI agents for planning, research, coding, testing, and deployment
- 🔄 **Real-time Updates**: Live log streaming and progress tracking
- 🐳 **Isolated Execution**: Each task runs in its own Docker container
- 📊 **AlgoKit Integration**: Automated project creation and deployment to Algorand LocalNet
- 🎨 **Modern UI**: Beautiful Angular frontend with intuitive interface

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   Angular   │─────▶│   FastAPI    │─────▶│ Agent Runner   │
│  Frontend   │      │   Backend    │      │  (Container)   │
└─────────────┘      └──────────────┘      └────────────────┘
                            │                       │
                            ▼                       ▼
                     ┌──────────────┐      ┌────────────────┐
                     │  Task Queue  │      │ AlgoKit        │
                     │  Management  │      │ LocalNet       │
                     └──────────────┘      └────────────────┘
```

### Components

1. **Angular Frontend** (`frontend/`)
   - Single-page application with modern UI
   - Real-time log streaming and status updates
   - Example prompts and interactive features

2. **FastAPI Backend** (`backend/`)
   - RESTful API for task management
   - Docker container orchestration
   - Environment variable forwarding to agent containers

3. **Agent Runner** (`agent-runner/`)
   - Multi-agent system using smol-agents framework
   - Specialized agents: Planner, Research (RAG), Coding, Testing, Deployment
   - AlgoKit integration for Algorand development

4. **Algorand LocalNet**
   - Local Algorand blockchain for testing
   - Uses your existing AlgoKit LocalNet running on the host machine
   - Connected via `host.docker.internal` from Docker containers

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (with Linux containers)
- **Docker Compose** v3.9+
- **Azure OpenAI** account with API access
- **AlgoKit LocalNet** running on your host machine (see below)

### Setup Instructions

#### 1. Start AlgoKit LocalNet

If you don't already have AlgoKit LocalNet running, start it first:

```bash
algokit localnet start
```

This will start the LocalNet on:
- **Algod**: http://localhost:4001
- **Indexer**: http://localhost:8980
- **KMD**: http://localhost:4002

The application is configured to use your host machine's LocalNet via `host.docker.internal`.

#### 2. Clone the Repository

```bash
git clone <repository-url>
cd algorand-ai-agent-hackathon
```

#### 3. Configure Environment Variables

Copy the example environment file and fill in your Azure OpenAI credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

**Where to get Azure OpenAI credentials:**

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Under "Keys and Endpoint", copy:
   - **Key 1** → `AZURE_OPENAI_API_KEY`
   - **Endpoint** → `AZURE_OPENAI_ENDPOINT`
4. Under "Model deployments", note your deployment name → `AZURE_OPENAI_DEPLOYMENT`

**Alternative**: If you prefer to use OpenAI directly instead of Azure, uncomment the `OPENAI_API_KEY` section in `.env`

**LocalNet Configuration**: The `.env` file is already configured to use `host.docker.internal:4001` to connect to your existing LocalNet. No changes needed unless you're using custom ports.

#### 4. Start the Application

```bash
docker compose up --build
```

This will:
- Build all Docker images
- Launch the FastAPI backend (connects to your LocalNet)
- Start the Angular frontend
- Build the agent-runner image

**First-time setup may take 5-10 minutes** to download images and install dependencies.

**Note**: Make sure your AlgoKit LocalNet is running before starting the application!

#### 5. Access the Application

Once all services are running:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Algorand Node**: http://localhost:4001

## 💻 Using the Application

### Web Interface

1. Open http://localhost:4200 in your browser
2. Enter a description of your smart contract in the text area
3. Click **"🚀 Generate & Deploy"**
4. Watch real-time logs as the AI agents work
5. View the deployment results including App ID and transaction details

### Example Prompts

Try these example prompts to get started:

- **Counter Contract**: "Create a simple counter contract with increment and decrement methods"
- **Token Swap**: "Create a token swap contract that allows users to exchange two different tokens"
- **Voting System**: "Create a voting contract where users can create proposals and vote on them"
- **Escrow**: "Create an escrow contract that holds funds until both parties agree to release"

### API Usage

You can also interact directly with the API:

**Create a new task:**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple counter contract"}'
```

Response:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Check task status:**
```bash
curl http://localhost:8000/api/status/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "status": "completed",
  "logs": ["[timestamp] Starting task...", "..."],
  "result": {
    "app_id": "1001",
    "project_name": "counter-contract",
    "contract_name": "CounterContract",
    "message": "Contract deployed successfully to LocalNet",
    "transaction_id": "ABC123..."
  }
}
```

## 🛠️ Development

### Local Development (Without Docker)

#### Backend Only

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

**Note**: Without Docker, the backend will use simulation mode and won't actually deploy contracts.

#### Frontend Only

```bash
cd frontend/algorand-ai-agent
npm install
npm run start
```

Runs on http://localhost:4200

The frontend expects the backend at http://localhost:8000 (CORS is enabled).

### Project Structure

```
algorand-ai-agent-hackathon/
├── frontend/
│   └── algorand-ai-agent/      # Angular application
│       ├── src/
│       │   └── app/
│       │       └── app.component.ts
│       └── package.json
├── backend/
│   ├── app/
│   │   └── main.py             # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── agent-runner/
│   ├── runner.py               # Multi-agent system
│   ├── docs/
│   │   └── algokit_guide.md    # AlgoKit documentation for RAG
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🤖 How It Works

### Multi-Agent Workflow

When you submit a prompt, the system executes the following workflow:

1. **Planner Agent**
   - Analyzes the user's requirements
   - Breaks down the task into actionable steps
   - Identifies contract features and methods needed

2. **Research Agent (RAG)**
   - Searches AlgoKit documentation
   - Finds relevant commands and best practices
   - Provides context-specific guidance

3. **Project Setup**
   - Creates AlgoKit project structure
   - Sets up proper directory hierarchy
   - Initializes necessary files

4. **Coding Agent**
   - Generates PyTeal/Beaker smart contract code
   - Implements the requested functionality
   - Creates proper contract structure with decorators

5. **Testing Agent**
   - Writes unit tests for the contract
   - Executes tests to verify functionality
   - Reports test results

6. **Deployment Agent**
   - Builds the smart contract
   - Deploys to Algorand LocalNet
   - Captures App ID and transaction details

### Technologies Used

- **Frontend**: Angular 18, TypeScript, RxJS
- **Backend**: FastAPI, Python 3.11, Pydantic
- **AI**: smol-agents, Azure OpenAI (gpt-4o-mini)
- **Blockchain**: AlgoKit, Algorand LocalNet, PyTeal, Beaker
- **Infrastructure**: Docker, Docker Compose

## 🔧 Configuration

### Environment Variables

All configuration is done through `.env` file. See `.env.example` for all available options.

**Required:**
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT` - Your model deployment name

**Optional:**
- `LITELLM_LOG=DEBUG` - Enable verbose logging for debugging
- `OPENAI_API_KEY` - Use OpenAI instead of Azure OpenAI

### Docker Compose Services

- `backend` - FastAPI backend (port 8000)
- `frontend` - Angular frontend (port 4200)
- `agent-runner` - Pre-built image for agent execution

**Note**: This application uses your existing AlgoKit LocalNet on the host machine instead of running LocalNet in a container.

## 📊 API Reference

### POST /api/generate

Create a new smart contract generation task.

**Request:**
```json
{
  "prompt": "Create a simple counter contract"
}
```

**Response:**
```json
{
  "task_id": "uuid-string"
}
```

### GET /api/status/{task_id}

Get the status and results of a task.

**Response:**
```json
{
  "status": "pending | in_progress | completed | failed",
  "logs": ["log line 1", "log line 2"],
  "result": {
    "app_id": "1001",
    "project_name": "project-name",
    "contract_name": "ContractName",
    "message": "Deployment message",
    "transaction_id": "txn-id"
  }
}
```

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Services won't start
```bash
# Check Docker is running
docker info

# Reset Docker Compose
docker compose down -v
docker compose up --build
```

**Problem**: Port conflicts
```bash
# Check what's using ports
netstat -an | findstr "4200 8000 4001"

# Change ports in docker-compose.yml if needed
```

### Azure OpenAI Issues

**Problem**: "No LLM credentials found"
- Verify `.env` file exists and contains valid credentials
- Check that `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` are set
- Ensure there are no quotes around values in `.env`

**Problem**: Rate limiting
- Azure OpenAI has request limits per minute
- Wait a moment and try again
- Consider upgrading your Azure OpenAI tier

### AlgoKit/LocalNet Issues

**Problem**: LocalNet not accessible
```bash
# Check if your AlgoKit LocalNet is running
algokit localnet status

# Start LocalNet if not running
algokit localnet start

# Test connectivity
curl http://localhost:4001/versions
```

**Problem**: Deployment fails with "Connection refused"
- Ensure AlgoKit LocalNet is running: `algokit localnet status`
- Verify LocalNet is accessible: `curl http://localhost:4001/versions`
- Check Docker can access host: The application uses `host.docker.internal` to connect from containers to your host's LocalNet
- On Linux, you may need to use `--network host` or configure `extra_hosts` in docker-compose.yml

### Agent Issues

**Problem**: Agent container fails
```bash
# View agent logs
docker compose logs backend

# Check agent-runner image
docker images | grep agent-runner

# Rebuild agent-runner
docker compose build agent-runner
```

## 🎯 Roadmap

- [x] Multi-agent system with smol-agents
- [x] AlgoKit integration and LocalNet deployment
- [x] RAG system with AlgoKit documentation
- [x] Real-time log streaming
- [x] Modern Angular UI
- [ ] Support for TestNet deployment
- [ ] Contract verification and auditing
- [ ] Template library for common contracts
- [ ] Multi-language support (TEALScript, Python)
- [ ] Persistent storage for generated contracts
- [ ] User authentication and project management

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

**Built for the Algorand AI Agent Hackathon** 🚀
