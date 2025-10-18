"""
Logging utilities for agent runner.
"""
from datetime import datetime


def log(message: str) -> None:
    """
    Print a timestamped log message.

    Args:
        message: Log message to print
    """
    timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    print(f"[{timestamp}] {message}", flush=True)
