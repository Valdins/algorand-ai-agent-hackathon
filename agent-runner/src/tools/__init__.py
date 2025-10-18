"""Tools for AI agents."""
from .shell import execute_shell_command
from .file_ops import read_file, write_file
from .documentation import search_documentation

ALL_TOOLS = [
    execute_shell_command,
    read_file,
    write_file,
    search_documentation,
]

__all__ = [
    "execute_shell_command",
    "read_file",
    "write_file",
    "search_documentation",
    "ALL_TOOLS",
]
