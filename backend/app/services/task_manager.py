"""
Task manager service for handling task storage and retrieval.
"""
import threading
from typing import Dict, Optional
from app.models import Task, TaskStatus
from app.core.logging import get_logger

logger = get_logger(__name__)


class TaskManager:
    """Thread-safe task manager for storing and retrieving tasks."""

    def __init__(self):
        """Initialize task manager."""
        self._tasks: Dict[str, Task] = {}
        self._lock = threading.Lock()

    def create_task(self, prompt: str) -> Task:
        """
        Create a new task.

        Args:
            prompt: User's natural language prompt

        Returns:
            Created task instance
        """
        task = Task(prompt)
        with self._lock:
            self._tasks[task.id] = task
        logger.info(f"Created task {task.id}")
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Get a task by ID.

        Args:
            task_id: Task identifier

        Returns:
            Task instance or None if not found
        """
        with self._lock:
            return self._tasks.get(task_id)

    def update_task_status(self, task_id: str, status: TaskStatus) -> None:
        """
        Update task status.

        Args:
            task_id: Task identifier
            status: New status
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.update_status(status)
                logger.info(f"Task {task_id} status updated to {status.value}")

    def add_task_log(self, task_id: str, message: str) -> None:
        """
        Add a log message to a task.

        Args:
            task_id: Task identifier
            message: Log message
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.add_log(message)

    def set_task_result(self, task_id: str, result: Dict) -> None:
        """
        Set task result.

        Args:
            task_id: Task identifier
            result: Result dictionary
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.set_result(result)
                logger.info(f"Task {task_id} result set")

    def set_task_error(self, task_id: str, error: str) -> None:
        """
        Set task error.

        Args:
            task_id: Task identifier
            error: Error message
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.set_error(error)
                logger.error(f"Task {task_id} failed: {error}")

    def get_all_tasks(self) -> Dict[str, Task]:
        """
        Get all tasks.

        Returns:
            Dictionary of all tasks
        """
        with self._lock:
            return self._tasks.copy()

    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task.

        Args:
            task_id: Task identifier

        Returns:
            True if task was deleted, False if not found
        """
        with self._lock:
            if task_id in self._tasks:
                del self._tasks[task_id]
                logger.info(f"Deleted task {task_id}")
                return True
            return False


# Global task manager instance
task_manager = TaskManager()
