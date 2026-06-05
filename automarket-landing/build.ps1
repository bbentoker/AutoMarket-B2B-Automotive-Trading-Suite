# SECURITY-SANITIZED: Deployment targets below are placeholders for public showcase.
# Stop on any error
$ErrorActionPreference = "Stop"

# Constants
$DOCKER_USERNAME = ""
$DOCKER_REPOSITORY = "landing-automarket"
$DOCKER_TAG = "latest"
$DOCKER_IMAGE = "$DOCKER_USERNAME/$DOCKER_REPOSITORY`:$DOCKER_TAG"
$BROWSE_URL = "https://browse.automarket.example.com"
$API_URL = "https://api.automarket.example.com"
$DASHBOARD_URL = "https://dashboard.automarket.example.com"

Write-Host "Starting build process..." -ForegroundColor Green
Write-Host "Image: $DOCKER_IMAGE" -ForegroundColor Cyan
Write-Host "Browse URL: $BROWSE_URL" -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Cyan
Write-Host "Dashboard URL: $DASHBOARD_URL" -ForegroundColor Cyan

# Run npm build
Write-Host "Running npm build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building Docker image..." -ForegroundColor Yellow

# Build the Docker image with proper line continuation
docker build --build-arg NEXT_PUBLIC_BROWSE_APP_URL="$BROWSE_URL" --build-arg NEXT_PUBLIC_API_BASE_URL="$API_URL" --build-arg NEXT_PUBLIC_DASHBOARD_URL="$DASHBOARD_URL" -t "$DOCKER_IMAGE" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

# Push the Docker image
Write-Host "Pushing Docker image to registry..." -ForegroundColor Yellow
docker push "$DOCKER_IMAGE"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed" -ForegroundColor Red
    exit 1
}

Write-Host "Build and push completed successfully!" -ForegroundColor Green
Write-Host "You can now run: docker run -p 3000:3000 $DOCKER_IMAGE" -ForegroundColor Yellow 