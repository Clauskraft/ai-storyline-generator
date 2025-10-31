@echo off
REM AI Storyline Generator - Docker Build Script for Windows
REM This script builds the Docker image with proper tagging

echo.
echo 🐳 Building AI Storyline Generator Docker Image...
echo.

REM Check if GEMINI_API_KEY is set
if not defined GEMINI_API_KEY (
    echo ⚠️  Warning: GEMINI_API_KEY environment variable is not set
    echo    You'll need to set it when running the container
    echo.
)

REM Get version from package.json
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set VERSION=%%i
echo 📦 Version: %VERSION%
echo.

REM Build the image
echo 🔨 Building Docker image...
docker build -t ai-storyline-generator:latest -t ai-storyline-generator:%VERSION% .

echo.
echo ✅ Build complete!
echo.
echo 🚀 To run the container:
echo    docker-compose up -d
echo.
echo    OR
echo.
echo    docker run -d -p 3001:3001 -e GEMINI_API_KEY=your_key ai-storyline-generator:latest
echo.
echo 📊 Image size:
docker images ai-storyline-generator:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
