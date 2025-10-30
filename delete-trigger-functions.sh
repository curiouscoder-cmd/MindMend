#!/bin/bash
# Delete old trigger functions so they can be recreated with correct type

echo "🗑️  Deleting old trigger functions..."

firebase functions:delete exportChatMessage --region=asia-south1 --force
firebase functions:delete exportExerciseCompletion --region=asia-south1 --force
firebase functions:delete exportMoodEntry --region=asia-south1 --force
firebase functions:delete onCrisisDetected --region=asia-south1 --force
firebase functions:delete onStreakMilestone --region=asia-south1 --force

echo "✅ Old functions deleted. Now run:"
echo "firebase deploy --only functions:exportChatMessage,functions:exportExerciseCompletion,functions:exportMoodEntry,functions:onCrisisDetected,functions:onStreakMilestone"
