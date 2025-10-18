"""
API endpoints for smart contract generation.
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    GenerateRequest,
    GenerateResponse,
    TaskStatusResponse,
    HealthResponse,
)
from app.services import task_manager, agent_executor
from app.services.payment_verifier import payment_verifier
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """
    Health check endpoint.

    Returns service health status and version.
    """
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION
    )


@router.post("/generate", response_model=GenerateResponse, tags=["tasks"])
async def generate_contract(request: GenerateRequest):
    """
    Generate and deploy a smart contract from a natural language prompt.

    This endpoint creates a new task that will:
    1. Analyze the prompt using AI agents
    2. Generate smart contract code
    3. Create tests
    4. Deploy to Algorand LocalNet

    Args:
        request: Generation request with prompt

    Returns:
        Task ID for tracking progress

    Raises:
        HTTPException: If prompt is invalid or task creation fails
    """
    prompt = request.prompt.strip()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )

    # Verify payment if transaction ID provided
    if hasattr(request, 'payment_txn_id') and request.payment_txn_id:
        if not hasattr(request, 'wallet_address') or not request.wallet_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="wallet_address required when payment_txn_id is provided"
            )

        verification = payment_verifier.verify_payment(
            request.payment_txn_id,
            request.wallet_address
        )

        if not verification["verified"]:
            raise HTTPException(
                status_code=402,  # Payment Required
                detail=f"Payment verification failed: {verification.get('message', 'Unknown error')}"
            )

        logger.info(f"Payment verified: {request.payment_txn_id} from {request.wallet_address}")

    try:
        # Create task
        task = task_manager.create_task(prompt)

        # Start agent execution in background
        agent_executor.execute_task(task.id, prompt)

        logger.info(f"Created and started task {task.id} for prompt: {prompt[:50]}...")

        return GenerateResponse(task_id=task.id)

    except Exception as e:
        logger.error(f"Failed to create task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )


@router.get("/status/{task_id}", response_model=TaskStatusResponse, tags=["tasks"])
async def get_task_status(task_id: str):
    """
    Get the status and results of a task.

    Args:
        task_id: Unique task identifier

    Returns:
        Task status, logs, and results

    Raises:
        HTTPException: If task not found
    """
    task = task_manager.get_task(task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    return TaskStatusResponse(
        status=task.status.value,
        logs=task.logs,
        result=task.result,
        error=task.error,
    )


@router.delete("/tasks/{task_id}", tags=["tasks"])
async def delete_task(task_id: str):
    """
    Delete a task.

    Args:
        task_id: Unique task identifier

    Returns:
        Success message

    Raises:
        HTTPException: If task not found
    """
    deleted = task_manager.delete_task(task_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    logger.info(f"Deleted task {task_id}")

    return {"message": f"Task {task_id} deleted successfully"}


@router.get("/tasks", tags=["tasks"])
async def list_tasks():
    """
    List all tasks.

    Returns:
        List of all tasks with their details
    """
    tasks = task_manager.get_all_tasks()

    return {
        "count": len(tasks),
        "tasks": [task.to_dict() for task in tasks.values()]
    }
