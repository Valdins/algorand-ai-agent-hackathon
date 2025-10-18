#!/bin/bash

# Algorand AI Agent - Quick Setup Script
# This script helps you set up the application for the first time

set -e

echo "=================================="
echo "Algorand AI Agent - Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker is installed"

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    echo "Please install Docker Compose or update Docker Desktop"
    exit 1
fi

echo "✓ Docker Compose is available"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your Azure OpenAI credentials in the .env file"
    echo ""
    echo "Please edit .env and add:"
    echo "  - AZURE_OPENAI_API_KEY"
    echo "  - AZURE_OPENAI_ENDPOINT"
    echo "  - AZURE_OPENAI_DEPLOYMENT"
    echo ""
    echo "Get these from: https://portal.azure.com (Azure OpenAI Service)"
    echo ""
    read -p "Press Enter when you have configured the .env file..."
else
    echo "✓ .env file already exists"
fi

# Verify .env has required variables
if ! grep -q "AZURE_OPENAI_API_KEY=.*[a-zA-Z0-9]" .env && ! grep -q "OPENAI_API_KEY=.*[a-zA-Z0-9]" .env; then
    echo ""
    echo "⚠️  Warning: No API keys found in .env file"
    echo "The application will not work without Azure OpenAI or OpenAI credentials"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please configure .env and run this script again."
        exit 1
    fi
fi

echo ""
echo "=================================="
echo "Starting Docker Compose build..."
echo "=================================="
echo ""
echo "This may take 5-10 minutes on first run..."
echo ""

# Build and start all services
docker compose up --build -d

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Services are starting up. This may take a minute..."
echo ""
echo "Access the application:"
echo "  - Frontend:  http://localhost:4200"
echo "  - Backend:   http://localhost:8000"
echo "  - API Docs:  http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker compose down"
echo ""
echo "Happy smart contract generation! 🚀"
