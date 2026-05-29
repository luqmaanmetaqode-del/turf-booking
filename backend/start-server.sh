#!/bin/bash

# TurfX Backend Startup Script
echo "🚀 Starting TurfX Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create .env file with required configuration."
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Make sure you're in the backend directory."
    exit 1
fi

# Kill any existing process on port 5001
echo "🔍 Checking for existing processes on port 5001..."
PID=$(lsof -ti:5001)
if [ ! -z "$PID" ]; then
    echo "🔪 Killing existing process on port 5001 (PID: $PID)"
    kill -9 $PID
    sleep 2
fi

# Start the server
echo "🎯 Starting server on port 5001..."
echo "📝 Logs will be shown below. Press Ctrl+C to stop."
echo "----------------------------------------"

# Start with production settings
NODE_ENV=production node server.js