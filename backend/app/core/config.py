"""
Application configuration management.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "Algorand AI Agent API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api"

    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Docker
    AGENT_IMAGE: str = "agent-runner:latest"
    DOCKER_NETWORK: str = "algorand-ai-agent-hackathon_algorand-network"

    # Azure OpenAI
    AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

    # OpenAI (alternative)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "")
    OPENAI_API_VERSION: str = os.getenv("OPENAI_API_VERSION", "")
    OPENAI_DEPLOYMENT: str = os.getenv("OPENAI_DEPLOYMENT", "")

    # Algorand LocalNet (using host machine's AlgoKit LocalNet)
    ALGOD_SERVER: str = os.getenv("ALGOD_SERVER", "http://host.docker.internal:4001")
    ALGOD_TOKEN: str = os.getenv("ALGOD_TOKEN", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    INDEXER_SERVER: str = os.getenv("INDEXER_SERVER", "http://host.docker.internal:8980")
    INDEXER_TOKEN: str = os.getenv("INDEXER_TOKEN", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

    # Payment Configuration
    PAYMENT_RECEIVER_ADDRESS: str = os.getenv("PAYMENT_RECEIVER_ADDRESS", "")
    DEPLOYMENT_COST_ALGO: str = os.getenv("DEPLOYMENT_COST_ALGO", "0.5")

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True
        env_file = ".env"


# Global settings instance
settings = Settings()
