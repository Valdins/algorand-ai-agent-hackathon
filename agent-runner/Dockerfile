# Agent runner image with AlgoKit and smol-agents
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install pipx and AlgoKit
RUN pip install --no-cache-dir pipx && \
    pipx ensurepath && \
    pipx install algokit

# Add pipx binaries to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Verify AlgoKit installation
RUN algokit --version

WORKDIR /app

# Copy requirements and install Python dependencies
COPY agent-runner/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy agent code and documentation
COPY agent-runner/runner.py runner.py
COPY agent-runner/src/ /app/src/
COPY agent-runner/docs/ /app/docs/

# Create workspace directory for agent operations
RUN mkdir -p /workspace
WORKDIR /workspace

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV WORKSPACE=/workspace
ENV PYTHONPATH=/app

# Use the new main entry point
ENTRYPOINT ["python", "/app/src/main.py"]
