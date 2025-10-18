"""
Shell execution tool for agents.
"""
import subprocess
from smolagents import tool
from src.core import config, log


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
            cwd=str(config.WORKSPACE_DIR)
        )
        output = result.stdout if result.returncode == 0 else result.stderr
        log(f"Command output: {output[:200]}...")
        return output
    except Exception as e:
        error_msg = f"Error executing command: {str(e)}"
        log(error_msg)
        return error_msg
