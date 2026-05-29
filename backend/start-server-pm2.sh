#!/bin/bash

# TurfX Backend PM2 Startup Script (Recommended for Production)
echo "🚀 Starting TurfX Backend with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "🔍 Stopping existing PM2 processes..."
pm2 stop turf-backend 2>/dev/null || true
pm2 delete turf-backend 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start with PM2
echo "🎯 Starting server with PM2..."
pm2 start server.js --name "turf-backend" --env production

# Save PM2 configuration
pm2 save

# Show status
echo "✅ Server started successfully!"
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔧 Useful PM2 Commands:"
echo "  pm2 logs turf-backend    # View logs"
echo "  pm2 restart turf-backend # Restart server"
echo "  pm2 stop turf-backend    # Stop server"
echo "  pm2 status               # Check status"
echo ""
echo "🌐 Server should be running on http://localhost:5001"