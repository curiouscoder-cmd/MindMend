# 🚀 MindMend AI - Dependency Installation Guide

## ⚡ **Quick Fix for Current Issues**

Your application is failing because of missing dependencies. Here's how to fix it:

### **Step 1: Install Required Dependencies**

Open your terminal in the MindMend project directory and run these commands:

```bash
# Navigate to your project (if not already there)
cd /Users/greenhacker/Desktop/gitRepos/MindMend

# Install Supabase for database functionality
npm install @supabase/supabase-js@^2.39.0

# Install ElevenLabs for voice synthesis (optional)
npm install elevenlabs@^0.8.2

# Clear any npm cache issues
npm cache clean --force

# Restart your development server
npm run dev
```

### **Step 2: If npm install fails, try these alternatives:**

#### **Option A: Use Yarn instead**
```bash
# Install yarn if you don't have it
npm install -g yarn

# Install dependencies with yarn
yarn add @supabase/supabase-js@^2.39.0
yarn add elevenlabs@^0.8.2

# Start the server
yarn dev
```

#### **Option B: Manual package.json update**
1. Open `package.json` in your editor
2. Add these lines to the dependencies section:
```json
"@supabase/supabase-js": "^2.39.0",
"elevenlabs": "^0.8.2"
```
3. Run `npm install`

#### **Option C: Use the application without external APIs**
The application is designed to work in demo mode! Just:
1. Make sure you have a `.env` file (copy from `.env.example`)
2. Start the server with `npm run dev`
3. The app will use browser TTS and offline storage

### **Step 3: Environment Setup**

```bash
# Copy the environment template
cp .env.example .env
```

Edit the `.env` file and add your API keys:
```env
# Required for AI features
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - will use browser TTS if not provided
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional - will use offline mode if not provided
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_key_here
```

### **Step 4: Get API Keys (Optional)**

#### **Google Gemini API** (Recommended)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in and create an API key
3. Add it to your `.env` file

#### **ElevenLabs API** (Optional)
1. Go to https://elevenlabs.io/app/speech-synthesis
2. Sign up and get your API key
3. Add it to your `.env` file

---

## 🎯 **What Works Right Now**

### **✅ Without Any API Keys:**
- Complete mood tracking system
- All CBT exercises with step-by-step guidance
- Progress tracking and gamification
- Community forums (with mock data)
- Crisis support mode
- Offline functionality
- Accessibility features

### **✅ With Gemini API Key:**
- AI-powered chat with Mira
- Personalized insights and recommendations
- Advanced mood analysis
- Intelligent exercise suggestions

### **✅ With All API Keys:**
- Natural voice synthesis
- Real-time database synchronization
- Advanced analytics
- Full production features

---

## 🛠️ **Troubleshooting**

### **Error: "Failed to resolve import"**
- Run: `npm install @supabase/supabase-js@^2.39.0`
- If that fails, the app will work in offline mode

### **Error: "ENOENT: no such file or directory"**
- Make sure you're in the correct directory
- Try: `cd /Users/greenhacker/Desktop/gitRepos/MindMend`
- Then run the npm install commands

### **Voice features not working**
- The app automatically falls back to browser TTS
- No additional setup required

### **Database features not working**
- The app automatically uses offline storage
- All features work the same way

---

## 🚀 **Quick Start Commands**

```bash
# Minimum setup (works immediately)
cp .env.example .env
npm run dev

# With Gemini API (recommended)
echo "VITE_GEMINI_API_KEY=your_key_here" >> .env
npm run dev

# Full setup (all features)
npm install @supabase/supabase-js@^2.39.0 elevenlabs@^0.8.2
# Add all API keys to .env
npm run dev
```

---

## 📱 **Demo Mode Features**

Even without API keys, you can demonstrate:

1. **Mood Selection & Tracking**
2. **CBT Exercises** (breathing, grounding, etc.)
3. **Progress & Gamification** (levels, achievements)
4. **Community Forums** (mock discussions)
5. **Crisis Support** (emergency resources)
6. **Accessibility Features** (high contrast, screen reader)
7. **Offline Functionality** (works without internet)

---

## 🎉 **Success!**

Once you see the application running at `http://localhost:5173`, you're ready to go!

The application is designed to be resilient and will work beautifully even in demo mode with mock data.

**Your MindMend AI platform is ready to transform mental health support! 🚀**
