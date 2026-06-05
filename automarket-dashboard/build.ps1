# SECURITY-SANITIZED: Deployment targets below are placeholders for public showcase.
# Constants
$DOCKER_USERNAME = ""
$PROJECT_NAME = "automarket-dashboard"
$IMAGE_TAG = "latest"
$DOCKER_IMAGE = "$DOCKER_USERNAME/$PROJECT_NAME`:$IMAGE_TAG"
$API_URL = "https://api.automarket.example.com/api"
$LANDING_URL = "https://buy.automarket.example.com"
$BROWSE_URL = "https://browse.automarket.example.com"
$PORT = "80"

# Build the application with npm
Write-Host "`nBuilding the application with npm...`n" -ForegroundColor Cyan
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nNPM build failed! Exiting...`n" -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "`nBuilding Docker image...`n" -ForegroundColor Cyan
docker build `
  --build-arg VITE_API_BASE_URL=$API_URL `
  --build-arg VITE_BROWSE_APP_URL=$BROWSE_URL `
  --build-arg VITE_LANDING_URL=$LANDING_URL `
  -t $DOCKER_IMAGE .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDocker build failed! Exiting...`n" -ForegroundColor Red
    exit 1
}

# Push the Docker image
Write-Host "`nPushing Docker image to registry...`n" -ForegroundColor Cyan
docker push $DOCKER_IMAGE

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDocker push failed! Exiting...`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nImage successfully pushed to Docker Hub!`n" -ForegroundColor Green
Write-Host "Image details:" -ForegroundColor Yellow
Write-Host "- Repository: $DOCKER_IMAGE" -ForegroundColor Yellow
Write-Host "- API URL: $API_URL" -ForegroundColor Yellow
Write-Host "- Landing URL: $LANDING_URL" -ForegroundColor Yellow
Write-Host "- Browse URL: $BROWSE_URL" -ForegroundColor Yellow
Write-Host "`nTo run the container locally, use:" -ForegroundColor Yellow
Write-Host "docker run -p $PORT`:$PORT $DOCKER_IMAGE" -ForegroundColor Yellow
