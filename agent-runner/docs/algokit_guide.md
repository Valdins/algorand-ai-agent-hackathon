# AlgoKit Quick Reference Guide

## Project Initialization

### Creating a New Smart Contract Project

Command: `algokit init`

This interactive command creates a new Algorand project. When prompted:

1. **Choose a template**: Select "Smart Contracts"
2. **Select smart contract language**: Choose "Python"
3. **Project name**: Enter a name (e.g., "hello-algorand", "token-contract")
4. **Smart contract name**: Enter contract name (e.g., "HelloWorld", "TokenManager")
5. **Template preset**: Select "Starter" for basic projects
6. **Select deployment language**: Choose "Python"
7. **Bootstrap dependencies**: Answer "yes" to install all dependencies
8. **Initialize git repository**: Answer "yes"

### Non-Interactive Project Creation

For programmatic/automated project creation, use:

```bash
algokit init --name <project-name> --template beaker --template-url gh:algorandfoundation/algokit-beaker-default-template --bootstrap
```

Or with all options:
```bash
algokit init \
  --name my-project \
  --template beaker \
  --defaults \
  --bootstrap \
  --git
```

## Project Structure

After initialization, your project will have this structure:

```
project-name/
├── smart_contracts/
│   └── contract_name/
│       ├── contract.py          # Main contract code
│       ├── deploy_config.py     # Deployment configuration
│       └── __init__.py
├── tests/
│   └── test_contract.py         # Unit tests
├── .algokit.toml                # AlgoKit configuration
├── pyproject.toml               # Python dependencies
└── README.md
```

## Smart Contract Development

### Contract File Location

The main contract code is in: `smart_contracts/<contract_name>/contract.py`

### Basic Contract Template (PyTeal/Beaker)

```python
from beaker import Application, GlobalStateValue
from pyteal import *

app = Application("ContractName")

# Global state
counter = GlobalStateValue(
    stack_type=TealType.uint64,
    default=Int(0),
)

@app.external
def hello(name: abi.String, *, output: abi.String) -> Expr:
    return output.set(Concat(Bytes("Hello, "), name.get()))

@app.external
def increment() -> Expr:
    return counter.set(counter + Int(1))

@app.external(read_only=True)
def get_counter(*, output: abi.Uint64) -> Expr:
    return output.set(counter)
```

## Building and Deployment

### Build the Contract

```bash
algokit project run build
```

This compiles the PyTeal code to TEAL and generates approval and clear programs.

### Deploy to LocalNet

First, ensure LocalNet is running:
```bash
algokit localnet start
```

Then deploy:
```bash
algokit project deploy localnet
```

Or use the combined command:
```bash
algokit project run deploy
```

### Deployment Output

The deployment will output:
- **App ID**: The unique identifier for the deployed contract
- **Transaction ID**: The transaction hash
- **Contract Address**: The Algorand address of the contract

Example output:
```
Deploying app...
App ID: 1001
Transaction ID: AAABBBCCC...
Contract deployed successfully!
```

## Testing

### Run Unit Tests

```bash
algokit project run test
```

Or directly with pytest:
```bash
pytest tests/
```

### Writing Tests

Test file location: `tests/test_<contract_name>.py`

Example test:
```python
import pytest
from algokit_utils import get_localnet_default_account
from algosdk.v2client.algod import AlgodClient
from smart_contracts.contract_name.contract import app

@pytest.fixture
def algod_client():
    return AlgodClient("a" * 64, "http://localhost:4001")

def test_hello(algod_client):
    # app_client = app.ApplicationClient(
    #     algod_client=algod_client,
    #     app=app,
    # )
    # 
    # app_client.create()
    # result = app_client.call("hello", name="World")
    # assert result.return_value == "Hello, World"
    pass
```

## LocalNet Management

### Start LocalNet
```bash
algokit localnet start
```

### Stop LocalNet
```bash
algokit localnet stop
```

### Reset LocalNet
```bash
algokit localnet reset
```

### Check LocalNet Status
```bash
algokit localnet status
```

## Common AlgoKit Commands

| Command | Description |
|---------|-------------|
| `algokit init` | Create new project |
| `algokit project run build` | Build smart contracts |
| `algokit project deploy localnet` | Deploy to LocalNet |
| `algokit project run test` | Run tests |
| `algokit localnet start` | Start local Algorand network |
| `algokit localnet stop` | Stop local network |
| `algokit localnet reset` | Reset local network state |
| `algokit bootstrap` | Install project dependencies |

## Environment Variables

For deployment, you may need:

```bash
# LocalNet (default)
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Indexer (optional)
INDEXER_SERVER=http://localhost
INDEXER_PORT=8980
INDEXER_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

## Troubleshooting

### Project Won't Build
- Ensure dependencies are installed: `algokit bootstrap`
- Check Python version: AlgoKit requires Python 3.10+

### LocalNet Won't Start
- Check Docker is running
- Reset LocalNet: `algokit localnet reset`
- Check ports 4001, 4002, 8980 are available

### Deployment Fails
- Ensure LocalNet is running: `algokit localnet status`
- Check contract syntax in contract.py
- Verify build completed successfully

## Best Practices

1. **Always build before deploying**: `algokit project run build`
2. **Test locally first**: Deploy to LocalNet before TestNet/MainNet
3. **Use meaningful names**: Contract and method names should be descriptive
4. **Handle errors**: Add proper error handling in contract methods
5. **Write tests**: Cover all contract methods with unit tests
6. **Version control**: Commit working code before major changes

## Quick Example Workflow

```bash
# 1. Create project
algokit init

# 2. Navigate to project
cd my-project

# 3. Start LocalNet
algokit localnet start

# 4. Edit contract
# Edit smart_contracts/my_contract/contract.py

# 5. Build
algokit project run build

# 6. Test
algokit project run test

# 7. Deploy
algokit project deploy localnet

# 8. Check deployment
# Note the App ID from output
```
