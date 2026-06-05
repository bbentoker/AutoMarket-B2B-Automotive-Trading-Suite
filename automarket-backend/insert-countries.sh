#!/bin/bash

echo "=========================================="
echo "Country Insertion Tool"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with database credentials."
    echo "Required variables for database connection:"
    echo "- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
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

# Check if countries.json exists
if [ ! -f "src/sql/countries.json" ]; then
    echo "❌ countries.json file not found at src/sql/countries.json"
    echo "Please ensure the file exists before running this script"
    exit 1
fi

echo "🌍 Starting country insertion process..."
echo ""

# Run the insertion script
node insert-countries.js "$@"

echo ""
echo "✅ Country insertion process completed!"
