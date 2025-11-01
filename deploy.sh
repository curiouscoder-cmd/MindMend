#!/bin/bash

# MindMend AI Deployment Script
# This script handles the complete deployment process

set -e  # Exit on error

echo "🚀 MindMend AI Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    print_success "Firebase CLI installed"
fi

# Check if logged in to Firebase
print_info "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Please login..."
    firebase login
fi

# Step 1: Install dependencies
print_info "Step 1/6: Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 2: Run tests
print_info "Step 2/6: Running tests..."
npm run test:run || {
    print_error "Tests failed. Do you want to continue? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
}
print_success "Tests completed"

# Step 3: Build frontend
print_info "Step 3/6: Building frontend..."
npm run build
print_success "Frontend built successfully"

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_info "Build size: $BUILD_SIZE"

# Step 4: Deploy Firebase Functions
print_info "Step 4/6: Deploying Firebase Functions..."
cd functions
npm install
cd ..
firebase deploy --only functions
print_success "Firebase Functions deployed"

# Step 5: Deploy Firestore rules and indexes
print_info "Step 5/6: Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes
print_success "Firestore rules and indexes deployed"

# Step 6: Deploy to Firebase Hosting
print_info "Step 6/6: Deploying to Firebase Hosting..."
firebase deploy --only hosting
print_success "Frontend deployed to Firebase Hosting"

echo ""
echo "=================================="
print_success "Deployment completed successfully!"
echo "=================================="
echo ""

# Get the hosting URL
PROJECT_ID=$(firebase use | grep "active" | awk '{print $4}' | tr -d '()')
HOSTING_URL="https://${PROJECT_ID}.web.app"

echo "🌐 Your app is live at:"
echo "   $HOSTING_URL"
echo ""
echo "📊 Firebase Console:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}"
echo ""
echo "🔧 Next steps:"
echo "   1. Test the deployed application"
echo "   2. Monitor Firebase Functions logs"
echo "   3. Check Firestore usage"
echo "   4. Verify FCM notifications"
echo ""
