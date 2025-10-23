#!/bin/bash

echo "🔥 MindMend Firebase Setup"
echo "=========================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI installed"
echo ""

# Login to Firebase
echo "📝 Logging into Firebase..."
firebase login

echo ""
echo "🎯 Next steps:"
echo "1. Run: firebase init"
echo "2. Select: Firestore, Functions, Hosting, Storage"
echo "3. Choose existing project or create new one"
echo "4. Create .env.local with your Firebase config"
echo ""
echo "See GOOGLE_NATIVE_MIGRATION.md for details"
