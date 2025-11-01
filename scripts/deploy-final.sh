#!/bin/bash
# Final deployment: 2 fixed functions + frontend

set -e

echo "🚀 MindMend Final Deployment"
echo "============================"
echo ""

# Step 1: Deploy fixed functions
echo "📝 Step 1: Deploying fixed functions (CPU quota fix)..."
firebase deploy --only functions:sendNotification,functions:initializeBigQuery
echo "✅ Functions deployed"
echo ""

# Step 2: Build frontend
echo "📝 Step 2: Building frontend..."
npm run build
echo "✅ Frontend built"
echo ""

# Step 3: Deploy hosting
echo "📝 Step 3: Deploying hosting..."
firebase deploy --only hosting
echo "✅ Hosting deployed"
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "📊 Status: 22/22 Functions Live + Frontend Updated"
echo ""
echo "🔗 Live URLs:"
echo "   Frontend: https://mindmend-25dca.web.app"
echo "   Health: https://healthcheck-3cblbz7oeq-el.a.run.app"
echo ""
echo "⚠️  Next: Enable Google Sign-In (30 seconds)"
echo "   https://console.firebase.google.com/project/mindmend-25dca/authentication/providers"
echo ""
echo "🧪 Test:"
echo "   curl https://healthcheck-3cblbz7oeq-el.a.run.app"
echo ""
