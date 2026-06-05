# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# How to Build and Deploy

This document provides instructions for building and deploying the Next.js application using Docker.

## Prerequisites

- Docker installed on your system
- Access to the required environment variables:
  - `NEXT_PUBLIC_BROWSE_APP_URL`
  - `NEXT_PUBLIC_API_BASE_URL`

## Building the Docker Image

1. Navigate to the project root directory:
```bash
cd automarket-landing
```

2. Build the Docker image with the required environment variables:
```bash
docker build \
  --build-arg NEXT_PUBLIC_BROWSE_APP_URL=your_browse_app_url \
  --build-arg NEXT_PUBLIC_API_BASE_URL=your_api_base_url \
  -t automarket-landing:latest .
```

Replace `your_browse_app_url` and `your_api_base_url` with your actual values.

## Running the Container Locally

To run the container locally:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BROWSE_APP_URL=your_browse_app_url \
  -e NEXT_PUBLIC_API_BASE_URL=your_api_base_url \
  automarket-landing:latest
```

The application will be available at `http://localhost:3000`.

## Deployment

### Option 1: Deploy to a Cloud Provider

1. Tag your image for your container registry:
```bash
docker tag automarket-landing:latest your-registry.com/automarket-landing:latest
```

2. Push the image to your container registry:
```bash
docker push your-registry.com/automarket-landing:latest
```

3. Deploy using your cloud provider's container service (e.g., AWS ECS, Google Cloud Run, Azure Container Instances).

### Option 2: Deploy to a Docker Host

1. Pull the image on your Docker host:
```bash
docker pull your-registry.com/automarket-landing:latest
```

2. Run the container with the required environment variables:
```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_BROWSE_APP_URL=your_browse_app_url \
  -e NEXT_PUBLIC_API_BASE_URL=your_api_base_url \
  your-registry.com/automarket-landing:latest
```

## Environment Variables

The application requires the following environment variables:

- `NEXT_PUBLIC_BROWSE_APP_URL`: The URL for the browse application
- `NEXT_PUBLIC_API_BASE_URL`: The base URL for the API

These variables must be provided both during build time (as build args) and runtime (as environment variables) to ensure proper functionality.

## Health Check

The application exposes port 3000. You can check if the application is running by accessing:
```
http://your-domain:3000
```

## Troubleshooting

1. If the container fails to start, check the logs:
```bash
docker logs [container_id]
```

2. To check the environment variables inside the container:
```bash
docker exec [container_id] env
```

3. To enter the container for debugging:
```bash
docker exec -it [container_id] /bin/sh
``` 