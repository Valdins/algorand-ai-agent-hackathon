"""
Pydantic schemas for API request/response models.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Request model for contract generation."""
    prompt: str = Field(..., min_length=1, description="Natural language prompt for smart contract")
    payment_txn_id: Optional[str] = Field(None, description="Algorand payment transaction ID for verification")
    wallet_address: Optional[str] = Field(None, description="Wallet address that sent the payment")

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Create a simple counter contract with increment and decrement methods",
                "payment_txn_id": "ABC123XYZ",
                "wallet_address": "ALGORAND_ADDRESS_HERE"
            }
        }


class GenerateResponse(BaseModel):
    """Response model for contract generation."""
    task_id: str = Field(..., description="Unique task identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class TaskStatusResponse(BaseModel):
    """Response model for task status."""
    status: str = Field(..., description="Task status: pending, in_progress, completed, or failed")
    logs: List[str] = Field(default=[], description="Task execution logs")
    result: Optional[Dict[str, Any]] = Field(None, description="Task result (if completed)")
    error: Optional[str] = Field(None, description="Error message (if failed)")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "completed",
                "logs": [
                    "[2025-01-15T10:30:00Z] Starting task...",
                    "[2025-01-15T10:30:05Z] PLANNER AGENT: Analyzing requirements...",
                    "[2025-01-15T10:30:10Z] Contract deployed successfully"
                ],
                "result": {
                    "app_id": "1001",
                    "project_name": "counter-contract",
                    "contract_name": "CounterContract",
                    "message": "Contract deployed successfully to LocalNet",
                    "transaction_id": "ABC123..."
                },
                "error": None
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str = Field(..., description="Service health status")
    version: str = Field(..., description="API version")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0"
            }
        }
