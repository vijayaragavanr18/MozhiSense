#!/bin/bash

# MozhiSense - Quick Setup Script for Mobile Development
# Run this script to get your app running on mobile in seconds

echo "🎉 MozhiSense - Mobile Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed"
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Display setup instructions
echo "================================"
echo "🚀 Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the dev server:"
echo "   npm run dev"
echo ""
echo "2. On your mobile device:"
echo ""
echo "   Option A: Same WiFi Network"
echo "   - Get your IP: ipconfig (Windows) or ifconfig (Mac/Linux)"
echo "   - Visit: http://192.168.X.X:3000"
echo ""
echo "   Option B: Chrome DevTools"
echo "   - Desktop: F12 → Click mobile icon"
echo "   - Select device (iPhone, Pixel, etc.)"
echo ""
echo "   Option C: Remote (ngrok)"
echo "   - Run: ngrok http 3000"
echo "   - Share public URL with team"
echo ""
echo "3. Install as PWA:"
echo ""
echo "   iPhone: Safari → Share → Add to Home Screen"
echo "   Android: Chrome → Menu → Install app"
echo "   Desktop: Click install icon in address bar"
echo ""
echo "4. Deploy to production:"
echo "   npm run build"
echo "   # Upload dist/ to Vercel or Netlify"
echo ""
echo "📚 Documentation:"
echo "   MOBILE-QUICK-START.md    ← Start here for mobile"
echo "   RESPONSIVE.md            ← Full responsive guide"
echo "   RESPONSIVE-SETUP.md      ← What was changed"
echo ""
echo "Happy coding! 🎨✨"
