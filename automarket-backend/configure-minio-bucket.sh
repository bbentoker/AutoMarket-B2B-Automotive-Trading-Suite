#!/bin/bash

echo "=========================================="
echo "MinIO Bucket Configuration Tool"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with MinIO credentials."
    echo "Required variables:"
    echo "- MINIO_ROOT_USER (or AWS_ACCESS_KEY_ID as fallback)"
    echo "- MINIO_ROOT_PASSWORD (or AWS_SECRET_ACCESS_KEY as fallback)"
    exit 1
fi

# Load environment variables
source .env

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "🚀 Starting MinIO bucket configuration tool..."
echo ""

# Run the configuration script
node configure-minio-bucket.js "$@"

echo ""
echo "✅ Configuration tool completed!"
