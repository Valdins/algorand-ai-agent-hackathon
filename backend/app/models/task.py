"""
Task model for managing smart contract generation tasks.
"""
import time
import uuid
from typing import Dict, Any, List, Optional
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Task:
    """Represents a smart contract generation task."""

    def __init__(self, prompt: str):
        """
        Initialize a new task.

        Args:
            prompt: The user's natural language prompt
        """
        self.id: str = str(uuid.uuid4())
        self.prompt: str = prompt
        self.status: TaskStatus = TaskStatus.PENDING
        self.logs: List[str] = []
        self.result: Optional[Dict[str, Any]] = None
        self.created_at: float = time.time()
        self.updated_at: float = time.time()
        self.error: Optional[str] = None

    def update_status(self, status: TaskStatus) -> None:
        """Update task status."""
        self.status = status
        self.updated_at = time.time()

    def add_log(self, message: str) -> None:
        """Add a log message."""
        if isinstance(message, str):
            # Split multi-line logs
            lines = message.splitlines()
            self.logs.extend(lines)
        else:
            self.logs.append(str(message))
        self.updated_at = time.time()

    def set_result(self, result: Dict[str, Any]) -> None:
        """Set the task result."""
        self.result = result
        self.updated_at = time.time()

    def set_error(self, error: str) -> None:
        """Set task error."""
        self.error = error
        self.status = TaskStatus.FAILED
        self.updated_at = time.time()

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        return {
            "id": self.id,
            "prompt": self.prompt,
            "status": self.status.value,
            "logs": self.logs,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
