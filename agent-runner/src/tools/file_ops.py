"""
File operation tools for agents.
"""
from pathlib import Path
from smolagents import tool
from src.core import config, log


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
        full_path = config.WORKSPACE_DIR / filepath
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
        full_path = config.WORKSPACE_DIR / filepath
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
        log(f"Wrote {len(content)} characters to {filepath}")
        return f"Successfully wrote to {filepath}"
    except Exception as e:
        error_msg = f"Error writing file: {str(e)}"
        log(error_msg)
        return error_msg
