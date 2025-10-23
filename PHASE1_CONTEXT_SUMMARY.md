# MindMend AI - Deep Repository Context Summary

## 🎯 Project Overview
**MindMend** is an AI-powered mental wellness platform for Indian youth (18-30) dealing with academic/social pressure. Built for **Google Gen AI Exchange Hackathon**.

**Live Demo**: https://minddmend.netlify.app/

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.1.0 + Vite 6.3.5 + TailwindCSS 3.4.17
- **AI**: Google Gemini API (@google/genai 0.3.0)
- **Database**: Supabase (PostgreSQL) + IndexedDB (offline)
- **Deployment**: Netlify + Serverless Functions
- **Voice**: ElevenLabs API + Web Speech API
- **Real-time**: Socket.io + WebRTC

### Module System
Pure ES6 modules (functional approach) - recently converted from CommonJS

---

## ✅ FULLY IMPLEMENTED FEATURES (95% Complete)

### Core Features
1. **Onboarding & Mood Selection** - 4 mood options with visual feedback
2. **CBT Exercise System** - Breathing, grounding, thought challenging, self-compassion
3. **Progress Tracking** - Visual charts, calm points, streaks, badges
4. **Gamification** - Points, levels, achievements, leaderboard

### AI Features
5. **AI Coach (Mira)** - Gemini-powered conversational support
6. **Voice Input** - Emotion detection from speech
7. **Doodle Mood Input** - AI analysis of drawings
8. **Emotional Twin** - AI companion mirroring emotional patterns
9. **AI Insights** - Pattern recognition and recommendations
10. **AI Group Therapy** - Facilitated group sessions

### Community
11. **Forums** - Anonymous discussions with real-time messaging
12. **Micro-Communities** - Small support groups (8-12 members)
13. **Voice Messaging** - Audio communication in community

### Crisis Support
14. **Crisis Mode** - Immediate help resources, hotlines, grounding techniques
15. **SOS Button** - Always-accessible emergency support

### Technical
16. **Offline-First** - Full functionality without internet (IndexedDB + sync queue)
17. **Database** - Complete Supabase schema with RLS policies
18. **Metrics Service** - Comprehensive analytics tracking
19. **Feedback Loop** - AI learns from user behavior
20. **Accessibility** - WCAG compliant with screen reader support

---

## 🚧 MISSING/INCOMPLETE (Need for Hackathon)

### HIGH PRIORITY
1. **Firebase Authentication** (20% done) - User login/signup
2. **Push Notifications (FCM)** (0%) - Daily check-ins, reminders
3. **Vertex AI Integration** (0%) - Upgrade from Gemini API

### MEDIUM PRIORITY
4. **Mobile App** (0%) - React Native version
5. **Professional Integration** (10%) - Therapist dashboard
6. **Multi-language** (0%) - Hindi + regional languages

### LOW PRIORITY
7. **Payment Integration** (0%) - Freemium model
8. **Admin Dashboard** (0%) - Platform management

---

## 📊 Current Google Cloud Usage

### Active Integrations
- **Gemini API** (via @google/genai) - Chat, mood analysis, exercise generation
- **Supabase** - PostgreSQL database with real-time

### NOT Using (Opportunities)
- Firebase Auth, FCM, Firestore, Cloud Functions
- Vertex AI, Cloud Run, BigQuery
- Cloud Vision, Natural Language, Speech-to-Text
- Cloud Storage, Secret Manager

---

## 🗂️ File Structure

```
MindMend/
├── src/
│   ├── components/ (27 React components)
│   ├── services/ (6 ES6 modules)
│   │   ├── geminiService.js
│   │   ├── databaseService.js
│   │   ├── offlineService.js
│   │   ├── elevenLabsService.js
│   │   ├── metricsService.js
│   │   └── feedbackLoopService.js
│   ├── hooks/ (2 custom hooks)
│   └── App.jsx
├── netlify/functions/ (9 serverless functions)
├── supabase/schema.sql (Complete DB schema)
└── Configuration (Vite, Tailwind, PostCSS)
```

---

## 🎯 Project Intent

### Mental Health Goals
1. **Promote Positive Mental States** - CBT exercises, mood tracking
2. **Track Moods** - Text, voice, doodle input methods
3. **Support Self-Reflection** - Journaling, thought challenging
4. **Connect with AI Coaches** - 24/7 empathetic support
5. **Community Support** - Peer encouragement
6. **Crisis Prevention** - AI-powered urgency detection

### Target Audience
- Young adults in India (18-30 years)
- Academic pressure, social anxiety, exam stress
- Culturally sensitive, evidence-based CBT

### Unique Value
- Offline-first architecture
- Multi-modal input (text/voice/doodle)
- AI personalization with feedback loop
- Gamification for engagement
- Anonymous community support
- Proactive crisis detection

---

## 📈 Database Schema (Supabase)

### Tables
- **users** - Profiles, preferences, personality traits
- **mood_entries** - Daily tracking with intensity/triggers
- **exercise_completions** - CBT tracking with before/after mood
- **forum_posts** - Community discussions
- **user_metrics** - Session analytics
- **feedback_data** - AI learning data
- **crisis_interventions** - Crisis tracking

### Features
- Row Level Security (RLS)
- Real-time subscriptions
- Offline sync queue
- Automatic timestamps

---

## 🔑 Environment Variables

```env
# Gemini AI
VITE_GEMINI_API_KEY=

# ElevenLabs Voice
VITE_ELEVENLABS_API_KEY=

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# WebRTC
VITE_WEBRTC_SERVER_URL=
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Key Insights

### Strengths
✅ Comprehensive feature set (20+ major features)
✅ Production-ready offline architecture
✅ Strong AI integration (Gemini API)
✅ Complete database schema
✅ Modern ES6 codebase
✅ Deployed and live

### Gaps for Hackathon
❌ No user authentication (critical)
❌ Limited Google Cloud integration (only Gemini)
❌ No push notifications
❌ No advanced AI (Vertex AI, Vision, NLP)
❌ No scalable deployment (Cloud Run)
❌ No data analytics (BigQuery)

### Hackathon Potential
The project has excellent foundation but needs deeper Google Cloud integration to maximize hackathon score. Priority: Firebase Auth, Vertex AI, Cloud Functions, FCM, BigQuery.

---

**Status**: Ready for Phase 2 - Strategic Planning & Google Cloud Integration
