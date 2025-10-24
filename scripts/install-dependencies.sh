#!/bin/bash

# MindMend AI - Dependency Installation Script
echo "🚀 Installing MindMend AI dependencies..."

# Install core dependencies
echo "📦 Installing core packages..."
npm install @supabase/supabase-js@^2.39.0

# Try to install ElevenLabs (optional)
echo "🎤 Installing ElevenLabs (optional)..."
npm install elevenlabs@^0.8.2 || echo "⚠️  ElevenLabs installation failed - voice features will use browser TTS"

echo "✅ Dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your API keys to .env file"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "🔑 Required API keys:"
echo "- Google Gemini API: https://makersuite.google.com/app/apikey"
echo "- ElevenLabs API (optional): https://elevenlabs.io/app/speech-synthesis"
echo "- Supabase (optional): https://supabase.com/dashboard"
