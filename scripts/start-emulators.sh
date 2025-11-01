#!/bin/bash

# MindMend Firebase Emulators Start Script
# This script starts all Firebase emulators for local testing

echo "🚀 Starting MindMend Firebase Emulators..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found!${NC}"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Please login:"
    firebase login
fi

# Create emulator data directory if it doesn't exist
if [ ! -d "./emulator-data" ]; then
    echo -e "${BLUE}📁 Creating emulator data directory...${NC}"
    mkdir -p ./emulator-data
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Creating .env.local for emulator configuration..."
    cat > .env.local << EOF
# Firebase Emulator Configuration
VITE_FUNCTIONS_URL=http://localhost:5001/mindmend-ai/asia-south1
VITE_USE_EMULATORS=true

# Firebase Config (replace with your actual values)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-ai
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
EOF
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.local with your Firebase config${NC}"
fi

echo ""
echo -e "${GREEN}Starting Firebase Emulators...${NC}"
echo ""
echo "Emulator URLs:"
echo -e "  ${BLUE}Emulator UI:${NC}    http://localhost:4000"
echo -e "  ${BLUE}Auth:${NC}           http://localhost:9099"
echo -e "  ${BLUE}Firestore:${NC}      http://localhost:8080"
echo -e "  ${BLUE}Functions:${NC}      http://localhost:5001"
echo -e "  ${BLUE}Storage:${NC}        http://localhost:9199"
echo -e "  ${BLUE}Hosting:${NC}        http://localhost:5000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop emulators${NC}"
echo ""

# Start emulators with data export on exit
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
