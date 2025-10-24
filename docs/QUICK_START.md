# MindMend AI - Quick Start Guide 🚀

## 🔧 **Immediate Fix for Current Issues**

The application is currently failing because of missing dependencies. Here's how to fix it:

### **Step 1: Install Missing Dependencies**

```bash
# Navigate to your project directory
cd /Users/greenhacker/Desktop/gitRepos/MindMend

# Install Supabase for database functionality
npm install @supabase/supabase-js@^2.39.0

# Install ElevenLabs for voice synthesis (optional)
npm install elevenlabs@^0.8.2

# Clear npm cache if needed
npm cache clean --force

# Restart the development server
npm run dev
```

### **Step 2: Environment Setup**

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your API keys
nano .env  # or use your preferred editor
```

Add your API keys to the `.env` file:
```env
# Required for AI features
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional for voice synthesis (will use browser TTS if not provided)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional for database (will use offline mode if not provided)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 3: Get API Keys**

#### **Google Gemini API (Required)**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

#### **ElevenLabs API (Optional - for voice synthesis)**
1. Go to [ElevenLabs](https://elevenlabs.io/app/speech-synthesis)
2. Sign up for a free account
3. Go to your profile settings
4. Copy your API key and add it to your `.env` file

#### **Supabase (Optional - for database)**
1. Go to [Supabase](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon key to your `.env` file

---

## 🎯 **Current Application Status**

### **✅ Working Features (No API Keys Required)**
- Mood tracking and selection
- CBT exercises with step-by-step guidance
- Progress tracking and gamification
- Offline mode with local storage
- Crisis mode with emergency resources
- Community forums (mock data)
- Accessibility features

### **🔑 Features Requiring API Keys**
- **AI Chat with Mira** (Requires Gemini API)
- **Voice synthesis** (Requires ElevenLabs API or uses browser TTS)
- **Advanced AI insights** (Requires Gemini API)
- **Real-time database** (Requires Supabase)

### **🎮 Demo Mode**
The application works perfectly in demo mode with mock data even without API keys!

---

## 🚀 **Quick Demo Instructions**

### **Without API Keys (Demo Mode)**
1. Start the development server: `npm run dev`
2. Open http://localhost:5173
3. Try these features:
   - Select your mood on the homepage
   - Complete a breathing exercise
   - Check your progress and achievements
   - Explore the community forums
   - Test the crisis support mode
   - Try the accessibility settings

### **With Gemini API Key**
1. Add your Gemini API key to `.env`
2. Restart the server
3. Now you can:
   - Chat with Mira (AI Coach)
   - Get personalized AI insights
   - Receive intelligent recommendations
   - Use advanced mood analysis

### **With All API Keys**
1. Add all API keys to `.env`
2. Restart the server
3. Experience the full platform:
   - Natural voice responses
   - Real-time database sync
   - Advanced analytics
   - Professional-grade features

---

## 🛠️ **Troubleshooting Common Issues**

### **Issue: "Failed to resolve import" errors**
```bash
# Solution: Install missing dependencies
npm install @supabase/supabase-js@^2.39.0
npm install elevenlabs@^0.8.2
npm run dev
```

### **Issue: API errors or "Network Error"**
```bash
# Check your .env file has the correct API keys
cat .env

# Verify API keys are valid by testing them directly
# For Gemini: https://makersuite.google.com/app/apikey
# For ElevenLabs: https://elevenlabs.io/app/speech-synthesis
```

### **Issue: Voice features not working**
- The app will automatically fall back to browser TTS
- Check browser console for any permission issues
- Ensure microphone permissions are granted

### **Issue: Database features not working**
- The app will automatically use offline mode
- All data is stored locally in IndexedDB
- Features work the same, just without cloud sync

---

## 📱 **Feature Overview**

### **🧠 Core Mental Wellness Features**
- **Mood Tracking**: Visual mood selection with history
- **CBT Exercises**: 6+ evidence-based therapeutic exercises
- **Progress Tracking**: Streaks, points, and achievements
- **Crisis Support**: Immediate help resources and interventions

### **🤖 AI-Powered Features**
- **AI Coach (Mira)**: Empathetic chat companion
- **Emotional Twin**: AI-generated personality insights
- **Voice Analysis**: Emotion detection from speech
- **Smart Recommendations**: Personalized exercise suggestions

### **👥 Community Features**
- **Discussion Forums**: Topic-based support groups
- **Micro-Communities**: Small, anonymous support circles
- **Group Therapy**: AI-simulated group sessions
- **Success Stories**: Peer inspiration and motivation

### **🎮 Engagement Features**
- **Gamification**: 8-level progression system
- **Achievements**: 20+ badge categories
- **Daily Goals**: Personalized wellness targets
- **Streaks**: Consistency tracking and rewards

### **♿ Accessibility Features**
- **Screen Reader Support**: Full ARIA compliance
- **High Contrast Mode**: Visual accessibility options
- **Keyboard Navigation**: Complete keyboard control
- **Voice Announcements**: Audio feedback for actions

### **📱 Technical Features**
- **Offline-First**: Works without internet connection
- **Progressive Web App**: Installable on mobile devices
- **Real-time Sync**: Data synchronization when online
- **Error Recovery**: Graceful fallbacks for all features

---

## 🎯 **Demo Script for Presentations**

### **5-Minute Demo Flow**
1. **Start** (30s): Show homepage with mood selection
2. **AI Chat** (60s): Demonstrate conversation with Mira
3. **Voice Input** (45s): Use voice to express feelings
4. **Emotional Twin** (60s): Show personalized AI insights
5. **Community** (45s): Browse forums and micro-communities
6. **Crisis Mode** (30s): Demonstrate emergency support
7. **Gamification** (30s): Show achievements and progress

### **Key Talking Points**
- "Mental health from taboo to habit"
- "AI-powered, culturally sensitive for Indian youth"
- "Works offline, syncs online"
- "Anonymous community support"
- "Evidence-based CBT techniques"
- "Crisis intervention with professional escalation"

---

## 💰 **Cost Summary for Demo**

### **Free Tier Usage (Demo)**
- **Google Gemini**: 60 requests/minute (free)
- **ElevenLabs**: 10,000 characters/month (free)
- **Supabase**: 500MB database (free)
- **Netlify**: 100GB bandwidth (free)

### **Total Demo Cost: $0/month**

### **Production Scaling**
- **1,000 users**: ~$400/month
- **10,000 users**: ~$1,600/month
- **100,000 users**: ~$6,400/month

---

## 🚀 **Next Steps After Demo**

### **Immediate (This Week)**
1. Get API keys and test all features
2. Deploy to Netlify for public demo
3. Create presentation materials
4. Test on mobile devices

### **Short-term (Next Month)**
1. User testing with real students
2. Partnership discussions with colleges
3. Professional therapist integration
4. Mobile app development

### **Long-term (3-6 Months)**
1. Clinical validation studies
2. Healthcare provider partnerships
3. Enterprise sales program
4. International expansion

---

## 📞 **Support & Resources**

### **Documentation**
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `ENHANCEMENT_ROADMAP.md` - Future development
- `COST_ESTIMATION_AND_MOCKUPS.md` - Business analysis

### **API Documentation**
- [Google Gemini API](https://ai.google.dev/docs)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

### **Getting Help**
- Check browser console for error messages
- Review the troubleshooting section above
- Test with minimal API keys first
- Use demo mode to verify core functionality

---

**🎉 Your MindMend AI platform is ready to transform mental health support! 🚀**

*Start with demo mode, add API keys gradually, and scale to production when ready.*
