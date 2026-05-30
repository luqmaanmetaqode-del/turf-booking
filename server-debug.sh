#!/bin/bash

echo "🔍 DEBUGGING SERVER NAVBAR ISSUE"
echo "================================="

echo "📍 Current directory:"
pwd

echo "📍 Git status:"
git status --porcelain

echo "📍 Current commit:"
git log --oneline -1

echo "📍 Remote status:"
git fetch origin main
git status

echo "📍 Checking navbar file on server:"
if [ -f "frontend/src/components/Navbar.jsx" ]; then
    echo "✅ Navbar file exists"
    
    if grep -q "Admin" frontend/src/components/Navbar.jsx; then
        echo "❌ PROBLEM: Admin button found in server navbar file!"
        echo "📄 Lines containing 'Admin':"
        grep -n "Admin" frontend/src/components/Navbar.jsx
    else
        echo "✅ Admin button not found in server navbar file"
    fi
    
    if grep -q "List Your Venue" frontend/src/components/Navbar.jsx; then
        echo "❌ PROBLEM: List Your Venue button found in server navbar file!"
        echo "📄 Lines containing 'List Your Venue':"
        grep -n "List Your Venue" frontend/src/components/Navbar.jsx
    else
        echo "✅ List Your Venue button not found in server navbar file"
    fi
else
    echo "❌ Navbar file not found!"
fi

echo "📍 Build directory status:"
if [ -d "frontend/build" ]; then
    echo "✅ Build directory exists"
    echo "📅 Build directory last modified:"
    ls -la frontend/build/static/js/main.*.js | head -1
else
    echo "❌ Build directory not found!"
fi

echo "📍 PM2 status:"
pm2 list

echo "================================="
echo "🔧 RECOMMENDED ACTIONS:"
echo "1. Force reset: git reset --hard origin/main"
echo "2. Clean rebuild: rm -rf frontend/build && cd frontend && npm run build"
echo "3. Restart services: pm2 restart all"