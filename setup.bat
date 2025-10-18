@echo off
REM Algorand AI Agent - Quick Setup Script (Windows)
REM This script helps you set up the application for the first time

echo ==================================
echo Algorand AI Agent - Setup
echo ==================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo X Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo + Docker is installed

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo X Error: Docker Compose is not available
    echo Please install Docker Compose or update Docker Desktop
    pause
    exit /b 1
)

echo + Docker Compose is available

REM Check if .env file exists
if not exist .env (
    echo.
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo + Created .env file
    echo.
    echo WARNING: You need to configure your Azure OpenAI credentials in the .env file
    echo.
    echo Please edit .env and add:
    echo   - AZURE_OPENAI_API_KEY
    echo   - AZURE_OPENAI_ENDPOINT
    echo   - AZURE_OPENAI_DEPLOYMENT
    echo.
    echo Get these from: https://portal.azure.com (Azure OpenAI Service)
    echo.
    pause
) else (
    echo + .env file already exists
)

echo.
echo ==================================
echo Starting Docker Compose build...
echo ==================================
echo.
echo This may take 5-10 minutes on first run...
echo.

REM Build and start all services
docker compose up --build -d

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo Services are starting up. This may take a minute...
echo.
echo Access the application:
echo   - Frontend:  http://localhost:4200
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo To view logs:
echo   docker compose logs -f
echo.
echo To stop the application:
echo   docker compose down
echo.
echo Happy smart contract generation! 🚀
echo.
pause
