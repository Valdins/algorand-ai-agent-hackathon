#!/usr/bin/env python3
"""
Agent Runner for Algorand Smart Contract Generation
Uses smol-agents framework with Azure OpenAI to generate and deploy smart contracts
"""
import argparse
import json
import os
import sys
import time
import subprocess
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Import smol-agents
from smolagents import (
    CodeAgent,
    LiteLLMModel,
    tool,
)

load_dotenv()


def log(msg: str):
    """Print timestamped message to stdout for backend to capture"""
    ts = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    print(f"[{ts}] {msg}", flush=True)


def run_command(cmd: List[str], cwd: Optional[str] = None, input_text: Optional[str] = None) -> tuple[int, str, str]:
    """Execute a shell command and return exit code, stdout, stderr"""
    log(f"Running command: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            input=input_text,
            timeout=300,  # 5 minute timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        log(f"Command timed out: {' '.join(cmd)}")
        return 1, "", "Command timed out"
    except Exception as e:
        log(f"Command failed: {e}")
        return 1, "", str(e)


# Define tools for agents
@tool
def execute_shell_command(command: str) -> str:
    """
    Execute a shell command and return the output.

    Args:
        command: The shell command to execute

    Returns:
        The command output or error message
    """
    log(f"Tool: Executing shell command: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300,
            cwd="/workspace"
        )
        output = result.stdout if result.returncode == 0 else result.stderr
        log(f"Command output: {output[:200]}...")
        return output
    except Exception as e:
        error_msg = f"Error executing command: {str(e)}"
        log(error_msg)
        return error_msg


@tool
def read_file(filepath: str) -> str:
    """
    Read the contents of a file.

    Args:
        filepath: Path to the file to read

    Returns:
        The file contents or error message
    """
    log(f"Tool: Reading file: {filepath}")
    try:
        full_path = Path("/workspace") / filepath
        with open(full_path, 'r') as f:
            content = f.read()
        log(f"Read {len(content)} characters from {filepath}")
        return content
    except Exception as e:
        error_msg = f"Error reading file: {str(e)}"
        log(error_msg)
        return error_msg


@tool
def write_file(filepath: str, content: str) -> str:
    """
    Write content to a file.

    Args:
        filepath: Path to the file to write
        content: Content to write to the file

    Returns:
        Success or error message
    """
    log(f"Tool: Writing to file: {filepath}")
    try:
        full_path = Path("/workspace") / filepath
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
        log(f"Wrote {len(content)} characters to {filepath}")
        return f"Successfully wrote to {filepath}"
    except Exception as e:
        error_msg = f"Error writing file: {str(e)}"
        log(error_msg)
        return error_msg


@tool
def search_documentation(query: str) -> str:
    """
    Search the AlgoKit documentation for information.

    Args:
        query: The search query

    Returns:
        Relevant documentation content
    """
    log(f"Tool: Searching documentation for: {query}")
    try:
        doc_path = Path(__file__).parent / "docs" / "algokit_guide.md"
        with open(doc_path, 'r') as f:
            docs = f.read()

        # Simple keyword search - return relevant sections
        lines = docs.split('\n')
        relevant_lines = []
        query_lower = query.lower()

        for i, line in enumerate(lines):
            if query_lower in line.lower():
                # Include context (5 lines before and after)
                start = max(0, i - 5)
                end = min(len(lines), i + 6)
                relevant_lines.extend(lines[start:end])
                relevant_lines.append("---")

        if relevant_lines:
            result = '\n'.join(relevant_lines[:500])  # Limit size
            log(f"Found {len(relevant_lines)} relevant lines")
            return result
        else:
            return "No specific documentation found. Please refer to general AlgoKit commands: algokit init, algokit project run build, algokit project deploy localnet"
    except Exception as e:
        error_msg = f"Error searching documentation: {str(e)}"
        log(error_msg)
        return error_msg


class AlgorandAgentSystem:
    """Multi-agent system for Algorand smart contract generation"""

    def __init__(self, prompt: str):
        self.prompt = prompt
        self.workspace = Path("/workspace")
        self.project_name = None
        self.contract_name = None
        self.app_id = None
        self.deployment_result = {}

        # Initialize LLM
        self.model = self._init_model()

        # Initialize agents
        self.tools = [
            execute_shell_command,
            read_file,
            write_file,
            search_documentation,
        ]

    def _init_model(self):
        """Initialize Azure OpenAI model"""
        log("Initializing Azure OpenAI model...")

        # Check for Azure OpenAI credentials
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")
        api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

        if not api_key or not endpoint:
            log("WARNING: Azure OpenAI credentials not found. Using fallback.")
            # Fallback to OpenAI if available
            if os.getenv("OPENAI_API_KEY"):
                return LiteLLMModel(model_id="gpt-4o-mini")
            else:
                raise ValueError("No LLM credentials found. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT")

        # Configure for Azure OpenAI
        model_id = f"azure/{deployment}"
        log(f"Using Azure OpenAI model: {deployment}")

        return LiteLLMModel(
            model_id=model_id,
            api_key=api_key,
            api_base=endpoint,
            api_version=api_version,
        )

    def run(self) -> Dict[str, Any]:
        """Execute the complete agent workflow"""
        log("=" * 60)
        log("Starting Algorand Smart Contract Deployment (Hardcoded Hello World)")
        log("=" * 60)

        try:
            # BYPASS ALL AI - Just deploy Hello World directly
            log("Skipping AI agents - using hardcoded Hello World contract")

            # Phase 1: Project Setup (no AI needed)
            self.setup_project()

            # Phase 2: Create hardcoded contract (no AI needed)
            self._create_hardcoded_hello_world()

            # Phase 3: Deploy (no AI needed)
            self.deployment_agent()

            # Return final result
            return {
                "app_id": self.app_id or "0",
                "message": self.deployment_result.get("message", "Deployment completed"),
                "project_name": self.project_name,
                "contract_name": self.contract_name,
                "transaction_id": self.deployment_result.get("transaction_id", ""),
                "prompt_excerpt": "Hardcoded Hello World contract",
            }

        except Exception as e:
            log(f"ERROR in agent workflow: {e}")
            raise

    def planner_agent(self) -> List[str]:
        """Planner Agent: Break down the prompt into actionable steps"""
        log("=" * 60)
        log("PLANNER AGENT: Analyzing requirements...")
        log("=" * 60)

        agent = CodeAgent(
            tools=[],
            model=self.model,
            max_steps=3,
        )

        planning_prompt = f"""
You are a planning agent for Algorand smart contract development.

User Request: {self.prompt}

Create a detailed plan for implementing this smart contract. Break it down into:
1. Contract requirements and features
2. State variables needed
3. Methods/functions to implement
4. Testing strategy

Keep the plan concise and actionable. Focus on what needs to be built.
"""

        try:
            response = agent.run(planning_prompt)
            plan_text = str(response)
            log(f"Plan created:\n{plan_text}")
            return plan_text.split('\n')
        except Exception as e:
            log(f"Planning agent error: {e}")
            # Fallback plan
            return [
                "1. Create AlgoKit project",
                "2. Implement contract logic",
                "3. Write tests",
                "4. Deploy to LocalNet"
            ]

    def research_agent(self) -> str:
        """Research Agent: Use RAG to find relevant AlgoKit information"""
        log("=" * 60)
        log("RESEARCH AGENT: Consulting AlgoKit documentation...")
        log("=" * 60)

        agent = CodeAgent(
            tools=[search_documentation],
            model=self.model,
            max_steps=5,
        )

        research_prompt = f"""
You are a research agent specialized in AlgoKit and Algorand development.

User wants to create: {self.prompt}

Search the documentation and provide:
1. The exact commands needed to create an AlgoKit project
2. How to structure the smart contract
3. How to build and deploy the contract
4. Any special considerations for this type of contract

Use the search_documentation tool to find relevant information.
"""

        try:
            response = agent.run(research_prompt)
            notes = str(response)
            log(f"Research notes:\n{notes}")
            return notes
        except Exception as e:
            log(f"Research agent error: {e}")
            return "Use algokit init to create project, then algokit project run build and deploy"

    def setup_project(self):
        """Set up the AlgoKit project structure"""
        log("=" * 60)
        log("PROJECT SETUP: Creating AlgoKit project...")
        log("=" * 60)

        # Derive project name from prompt
        self.project_name = self._sanitize_name(self.prompt)
        self.contract_name = self._to_contract_name(self.project_name)

        log(f"Project name: {self.project_name}")
        log(f"Contract name: {self.contract_name}")

        # Ensure workspace exists
        self.workspace.mkdir(exist_ok=True)
        os.chdir(self.workspace)

        # Check if algokit is installed
        rc, stdout, stderr = run_command(["algokit", "--version"])
        if rc != 0:
            log("ERROR: AlgoKit not installed!")
            raise RuntimeError("AlgoKit not found in container")

        log(f"AlgoKit version: {stdout.strip()}")

        # Start LocalNet
        log("Starting AlgoKit LocalNet...")
        run_command(["algokit", "localnet", "start"])
        time.sleep(5)  # Give LocalNet time to start

        # Create project non-interactively
        log("Creating AlgoKit project...")

        # Use algokit init with answers piped
        project_dir = self.workspace / self.project_name
        if project_dir.exists():
            log(f"Project directory {self.project_name} already exists, removing...")
            run_command(["rm", "-rf", str(project_dir)])

        # Create minimal project structure manually
        project_dir.mkdir(exist_ok=True)
        (project_dir / "smart_contracts").mkdir(exist_ok=True)
        (project_dir / "smart_contracts" / self.contract_name).mkdir(exist_ok=True)
        (project_dir / "tests").mkdir(exist_ok=True)

        log(f"Created project structure at {project_dir}")

    def coding_agent(self):
        """Coding Agent: Generate the smart contract code"""
        log("=" * 60)
        log("CODING AGENT: Using hardcoded Hello World contract for testing...")
        log("=" * 60)

        # Skip AI generation for now, use hardcoded contract
        log("Creating Hello World contract (hardcoded for testing)")
        self._create_hardcoded_hello_world()

    def _create_hardcoded_hello_world(self):
        """Create hardcoded Hello World contract for testing deployment"""
        contract_code = f'''from beaker import Application
from pyteal import *

app = Application("{self.contract_name}")

@app.external
def hello(name: abi.String, *, output: abi.String) -> Expr:
    """Say hello to someone"""
    return output.set(Concat(Bytes("Hello, "), name.get()))
'''

        contract_path = self.workspace / self.project_name / "smart_contracts" / self.contract_name / "contract.py"
        contract_path.parent.mkdir(parents=True, exist_ok=True)
        contract_path.write_text(contract_code)
        log(f"Created Hello World Beaker contract at {contract_path}")

        # Create __init__.py
        init_path = contract_path.parent / "__init__.py"
        init_path.write_text("")
        log(f"Created __init__.py at {init_path}")

    def _create_fallback_contract(self):
        """Create a simple fallback contract if agent fails"""
        contract_code = f'''from beaker import Application, GlobalStateValue
from pyteal import *

app = Application("{self.contract_name}")

# Define counter state variable with explicit key
counter = GlobalStateValue(
    stack_type=TealType.uint64,
    key="counter",
    default=Int(0),
)

@app.external
def hello(name: abi.String, *, output: abi.String) -> Expr:
    """Say hello to someone"""
    return output.set(Concat(Bytes("Hello, "), name.get()))

@app.external
def increment() -> Expr:
    """Increment the counter"""
    return counter.set(counter + Int(1))

@app.external(read_only=True)
def get_counter(*, output: abi.Uint64) -> Expr:
    """Get the current counter value"""
    return output.set(counter)
'''

        contract_path = self.workspace / self.project_name / "smart_contracts" / self.contract_name / "contract.py"
        contract_path.parent.mkdir(parents=True, exist_ok=True)
        contract_path.write_text(contract_code)
        log(f"Created fallback contract at {contract_path}")

        # Create __init__.py
        init_path = contract_path.parent / "__init__.py"
        init_path.write_text("")

    def testing_agent(self) -> bool:
        """Testing Agent: Create and run tests"""
        log("=" * 60)
        log("TESTING AGENT: Creating and running tests...")
        log("=" * 60)

        agent = CodeAgent(
            tools=[write_file, read_file, execute_shell_command],
            model=self.model,
            max_steps=10,
        )

        testing_prompt = f"""
You are a testing agent for Algorand smart contracts.

Contract location: {self.project_name}/smart_contracts/{self.contract_name}/contract.py

Create a test file at: {self.project_name}/tests/test_{self.contract_name}.py

The test should:
1. Import necessary testing libraries (pytest, algokit_utils)
2. Set up a LocalNet client
3. Test the contract methods
4. Verify the expected behavior

After creating the test, run it using: cd {self.project_name} && pytest tests/ -v

Use the write_file and execute_shell_command tools.
"""

        try:
            response = agent.run(testing_prompt)
            log(f"Testing agent completed: {response}")

            # Check if tests passed by looking at the output
            if "passed" in str(response).lower() or "ok" in str(response).lower():
                log("Tests PASSED ✓")
                return True
            else:
                log("Tests FAILED or not run")
                return False
        except Exception as e:
            log(f"Testing agent error: {e}")
            return False

    def deployment_agent(self):
        """Deployment Agent: Build and deploy the contract"""
        log("=" * 60)
        log("DEPLOYMENT AGENT: Building and deploying contract...")
        log("=" * 60)

        project_path = self.workspace / self.project_name

        # Install dependencies
        log("Installing Python dependencies...")
        rc, stdout, stderr = run_command(
            ["pip", "install", "beaker-pyteal", "pyteal", "algokit-utils"],
            cwd=str(project_path)
        )
        if rc != 0:
            log(f"Warning: pip install had issues: {stderr}")

        # Build the contract
        log("Building smart contract...")
        contract_path = project_path / "smart_contracts" / self.contract_name / "contract.py"

        if not contract_path.exists():
            raise RuntimeError(f"Contract file not found: {contract_path}")

        # Create a simple deployment script
        # Get algod server from environment or use default
        algod_server = os.getenv("ALGOD_SERVER", "http://localhost:4001")
        algod_token = os.getenv("ALGOD_TOKEN", "a" * 64)

        log("Creating deployment script...")
        deploy_script = f'''#!/usr/bin/env python3
import sys
import os
from algosdk.v2client import algod
import algokit_utils
from smart_contracts.{self.contract_name}.contract import app

# Connect to LocalNet
algod_server = os.getenv("ALGOD_SERVER", "{algod_server}")
algod_token = os.getenv("ALGOD_TOKEN", "{algod_token}")

print(f"Connecting to Algorand node at {{algod_server}}...")

try:
    algod_client = algod.AlgodClient(algod_token, algod_server)
    status = algod_client.status()
    print(f"✓ Connected to node. Last round: {{status.get('last-round')}}")
except Exception as e:
    print(f"ERROR: Cannot connect to Algorand node: {{e}}", file=sys.stderr)
    sys.exit(1)

try:
    account = algokit_utils.get_localnet_default_account(algod_client)
    print(f"✓ Using account: {{account.address}}")
except Exception as e:
    print(f"ERROR: Cannot get LocalNet account: {{e}}", file=sys.stderr)
    sys.exit(1)

try:
    print("Deploying contract...")
    app_id, app_addr, txn_id = app.create(
        algod_client,
        signer=account.signer,
        sender=account.address,
    )
    print(f"DEPLOYED_APP_ID: {{app_id}}")
    print(f"DEPLOYED_TXN: {{txn_id}}")
    print(f"✓ Deployment successful!")
except Exception as e:
    print(f"ERROR: Deployment failed: {{e}}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
'''

        deploy_path = project_path / "deploy.py"
        deploy_path.write_text(deploy_script)
        deploy_path.chmod(0o755)

        log("Running deployment script...")
        rc, stdout, stderr = run_command(
            ["python", "deploy.py"],
            cwd=str(project_path)
        )

        if rc == 0:
            log(f"Deployment output:\n{stdout}")

            # Parse App ID from output
            app_id_match = re.search(r'DEPLOYED_APP_ID:\s*(\d+)', stdout)
            txn_match = re.search(r'DEPLOYED_TXN:\s*(\S+)', stdout)

            if app_id_match:
                self.app_id = app_id_match.group(1)
                log(f"✓ Successfully deployed! App ID: {self.app_id}")
            else:
                self.app_id = "unknown"
                log("WARNING: Deployment completed but could not parse App ID")

            self.deployment_result = {
                "message": "Contract deployed successfully to LocalNet",
                "transaction_id": txn_match.group(1) if txn_match else "",
                "network": "localnet",
            }
        else:
            # Deployment failed - this should propagate as an error
            log(f"ERROR: Deployment failed!\n{stderr}")

            # Check if it's a connection error
            if "Cannot connect to Algorand node" in stderr or "Connection refused" in stderr:
                error_msg = "⚠️ Cannot connect to Algorand LocalNet. Please ensure LocalNet is running at the configured address. Run: algokit localnet start"
            elif "ApplicationClient" in stderr or "AttributeError" in stderr:
                error_msg = "⚠️ Deployment script error: Incorrect API usage. This is a code generation issue."
            else:
                error_msg = f"Deployment failed: {stderr[:500]}"

            # Raise an exception instead of silently continuing
            raise RuntimeError(f"Deployment failed: {error_msg}\n\nFull error:\n{stderr}")

    def _sanitize_name(self, text: str) -> str:
        """Convert text to valid project name"""
        # Remove special chars, convert to lowercase
        name = re.sub(r'[^a-zA-Z0-9\s-]', '', text.lower())
        # Replace spaces with hyphens
        name = re.sub(r'\s+', '-', name)
        # Limit length
        name = name[:30]
        # Remove leading/trailing hyphens
        name = name.strip('-')
        return name if name else "algorand-contract"

    def _to_contract_name(self, project_name: str) -> str:
        """Convert project name to contract class name"""
        # Remove hyphens and capitalize each word
        parts = project_name.split('-')
        return ''.join(word.capitalize() for word in parts if word)


def main():
    parser = argparse.ArgumentParser(description="Algorand AI Agent Runner")
    parser.add_argument("--prompt", required=True, help="Natural language prompt for smart contract")
    args = parser.parse_args()

    prompt = args.prompt.strip()
    if not prompt:
        log("ERROR: No prompt provided")
        return 2

    log(f"Received prompt: {prompt}")

    # Verify environment
    if not os.getenv("AZURE_OPENAI_API_KEY") and not os.getenv("OPENAI_API_KEY"):
        log("WARNING: No LLM API keys found. Please set AZURE_OPENAI_API_KEY or OPENAI_API_KEY")
        log("Attempting to continue anyway...")

    try:
        # Initialize and run agent system
        system = AlgorandAgentSystem(prompt)
        result = system.run()

        # Print final result for backend to capture
        print("RESULT: " + json.dumps(result), flush=True)
        log("Agent workflow completed successfully!")
        return 0

    except Exception as e:
        log(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
