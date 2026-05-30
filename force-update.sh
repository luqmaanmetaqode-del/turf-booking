#!/bin/bash

echo "🔄 Force updating navbar changes..."

# Reset any local changes
git reset --hard HEAD

# Force pull latest changes
git fetch origin main
git reset --hard origin/main

# Show current commit
echo "📍 Current commit:"
git log --oneline -1

# Check if navbar file has the changes
echo "🔍 Checking navbar file..."
if grep -q "Admin" frontend/src/components/Navbar.jsx; then
    echo "❌ Admin button still found in navbar!"
else
    echo "✅ Admin button removed from navbar"
fi

if grep -q "List Your Venue" frontend/src/components/Navbar.jsx; then
    echo "❌ List Your Venue button still found in navbar!"
else
    echo "✅ List Your Venue button removed from navbar"
fi

# Rebuild frontend
echo "🔨 Rebuilding frontend..."
cd frontend
rm -rf build node_modules/.cache
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart turf-frontend
pm2 restart turf-backend

echo "✅ Update complete!"