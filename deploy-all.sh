#!/bin/bash
# Complete deployment script for Gemini-only MindMend

set -e

echo "🚀 MindMend Gemini-Only Deployment"
echo "=================================="
echo ""

# Step 1: Delete old trigger functions
echo "📝 Step 1: Deleting old trigger functions..."
firebase functions:delete exportChatMessage --region=asia-south1 --force || true
firebase functions:delete exportExerciseCompletion --region=asia-south1 --force || true
firebase functions:delete exportMoodEntry --region=asia-south1 --force || true
firebase functions:delete onCrisisDetected --region=asia-south1 --force || true
firebase functions:delete onStreakMilestone --region=asia-south1 --force || true
echo "✅ Old functions deleted"
echo ""

# Step 2: Deploy all functions
echo "📝 Step 2: Deploying all functions..."
firebase deploy --only functions
echo "✅ Functions deployed"
echo ""

# Step 3: Build frontend
echo "📝 Step 3: Building frontend..."
npm run build
echo "✅ Frontend built"
echo ""

# Step 4: Deploy hosting
echo "📝 Step 4: Deploying hosting..."
firebase deploy --only hosting
echo "✅ Hosting deployed"
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "🔗 Live URLs:"
echo "   Frontend: https://mindmend-25dca.web.app"
echo "   Functions: https://asia-south1-mindmend-25dca.cloudfunctions.net"
echo ""
echo "🧪 Test with:"
echo "   curl https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck"
echo ""
