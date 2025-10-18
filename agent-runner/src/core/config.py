"""
Configuration for agent runner.
"""
import os
from pathlib import Path


class Config:
    """Agent runner configuration."""

    # Workspace
    WORKSPACE_DIR = Path("/workspace")

    # LLM Configuration
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
    AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # Algorand Configuration
    ALGOD_SERVER = os.getenv("ALGOD_SERVER", "http://localhost:4001")
    ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "a" * 64)

    # Documentation path
    DOCS_DIR = Path(__file__).parent.parent.parent / "docs"


config = Config()
