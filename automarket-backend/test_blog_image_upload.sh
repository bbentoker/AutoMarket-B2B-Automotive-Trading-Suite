#!/bin/bash

# Test script for Blog Image Upload API
# This script demonstrates how to create a blog with image upload

echo "Testing Blog Image Upload API..."
echo "=================================="

# API URL
API_URL="http://localhost:3000/api/blogs/create-with-image"

# Test 1: Create blog with image
echo "Test 1: Creating blog with image upload..."
echo ""

# You can replace this with an actual image path
IMAGE_PATH="/path/to/your/image.jpg"

# Check if image file exists
if [ ! -f "$IMAGE_PATH" ]; then
    echo "WARNING: Image file not found at $IMAGE_PATH"
    echo "Please update the IMAGE_PATH variable with a valid image file path"
    echo ""
    
    # Create a dummy test without image
    echo "Creating blog without image as fallback..."
    curl -X POST "$API_URL" \
      -F "title=Test Blog Post $(date +%Y%m%d-%H%M%S)" \
      -F "excerpt=This is a test blog post created via API" \
      -F "category=Test Category" \
      -F "date=$(date +%Y-%m-%d)" \
      -F "read_time=3 min read" \
      -F "content=This is the full content of the test blog post. It demonstrates the API functionality." \
      -F "featured=true" \
      -F "is_published=true" \
      -F "author_id=1"
else
    echo "Creating blog with image..."
    curl -X POST "$API_URL" \
      -F "title=Test Blog with Image $(date +%Y%m%d-%H%M%S)" \
      -F "excerpt=This is a test blog post with image upload" \
      -F "category=Test Category" \
      -F "date=$(date +%Y-%m-%d)" \
      -F "read_time=5 min read" \
      -F "content=This blog post includes an uploaded image stored as base64 in the database." \
      -F "featured=true" \
      -F "is_published=true" \
      -F "author_id=1" \
      -F "image=@$IMAGE_PATH"
fi

echo ""
echo ""
echo "Test completed!"
echo ""
echo "Usage Instructions:"
echo "1. Update the IMAGE_PATH variable with your image file path"
echo "2. Make sure your server is running on localhost:3000"
echo "3. Run: chmod +x test_blog_image_upload.sh && ./test_blog_image_upload.sh"
echo ""
echo "Example with specific image:"
echo "curl -X POST \"http://localhost:3000/api/blogs/create-with-image\" \\"
echo "  -F \"title=Car Market Analysis 2024\" \\"
echo "  -F \"excerpt=Deep dive into the European car market trends\" \\"
echo "  -F \"category=Market Analysis\" \\"
echo "  -F \"date=2024-01-20\" \\"
echo "  -F \"read_time=8 min read\" \\"
echo "  -F \"content=The European car market has seen significant changes...\" \\"
echo "  -F \"featured=true\" \\"
echo "  -F \"is_published=true\" \\"
echo "  -F \"author_id=1\" \\"
echo "  -F \"image=@C:\\Users\\YourName\\Pictures\\car-market-chart.jpg\"" 