# SECURITY-SANITIZED: Deployment targets below are placeholders for public showcase.
# Set variables
$API_BASE_URL = "https://api.automarket.example.com"
$IMAGE_NAME = "automarket-admin"
$IMAGE_TAG = "latest"

# Print build information
Write-Host "Building Docker image with the following configuration:" -ForegroundColor Cyan
Write-Host "API Base URL: $API_BASE_URL"
Write-Host "Image: $IMAGE_NAME`:$IMAGE_TAG"
Write-Host ""

# Build the Docker image with the API base URL
Write-Host "Starting Docker build..." -ForegroundColor Yellow
docker build `
    --build-arg VITE_API_BASE_URL=$API_BASE_URL `
    -t $IMAGE_NAME`:$IMAGE_TAG `
    .

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
    
    # Push the image to Docker Hub
    Write-Host "`nPushing image to Docker Hub..." -ForegroundColor Yellow
    docker push $IMAGE_NAME`:$IMAGE_TAG
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nImage successfully pushed to Docker Hub!" -ForegroundColor Green
        Write-Host "You can now run the image using: docker run -p 80:80 $IMAGE_NAME`:$IMAGE_TAG"
    } else {
        Write-Host "`nFailed to push image to Docker Hub!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
} 