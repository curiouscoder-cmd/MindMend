# 🧠 MindMend

> **AI-Powered Mental Wellness Platform for Young Adults**

MindMend is a comprehensive mental health support application that combines evidence-based Cognitive Behavioral Therapy (CBT) techniques with advanced AI technology to provide personalized mental wellness support. Designed specifically for young adults in India dealing with academic and social pressures.

[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange?logo=firebase)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5-purple?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-ISC-green)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technical Stack](#-technical-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

---

## ✨ Features

### Frontend Features

#### 🏠 **Home Dashboard**
- **Mood Tracking**: Select from 10 different mood states with emoji-based interface
- **Weekly Statistics**: Visual mood trends and consistency tracking
- **Personalized Greeting**: User-specific welcome messages
- **Quick Actions**: Fast access to all features from the home screen

#### 🤖 **AI Coach (Mira)**
- **Conversational AI**: Powered by Google Gemini 2.0 Flash
- **Context-Aware**: Remembers user history, mood patterns, and progress
- **CBT-Based Guidance**: Evidence-based therapeutic techniques
- **Culturally Sensitive**: Tailored for Indian youth with appropriate language
- **Real-time Responses**: Streaming text generation for natural conversations
- **Multilingual Support**: Translation capabilities for regional languages

#### 🧘 **CBT Tools Suite**

##### 📝 Triple-Column Worksheet
- **Step-by-Step Guidance**: Structured thought recording process
- **AI Distortion Detection**: Automatically identifies cognitive distortions using Gemini AI
- **10 Distortion Types**: Based on David Burns' "Feeling Good" methodology
  - All-or-Nothing Thinking
  - Overgeneralization
  - Mental Filter
  - Disqualifying the Positive
  - Jumping to Conclusions
  - Magnification/Minimization
  - Emotional Reasoning
  - Should Statements
  - Labeling
  - Personalization
- **Rational Response Builder**: Guided reframing of negative thoughts
- **History Tracking**: Save and review past thought records
- **Statistics Dashboard**: Track distortion patterns over time
- **Auto-save**: Never lose your progress

##### 📚 Distortion Library
- **Educational Resource**: Complete guide to all 10 cognitive distortions
- **Search Functionality**: Quick lookup of specific distortions
- **Real Examples**: Practical examples for each distortion type
- **Expandable Cards**: Detailed explanations with visual design
- **Color-Coded System**: Easy identification of distortion types

##### 🎯 Dynamic Thought Challenger
- **Socratic Questioning**: AI-powered guided self-inquiry
- **Adaptive Questions**: Questions tailored to specific thought patterns
- **Evidence Examination**: Structured analysis of thought validity
- **Alternative Perspectives**: Generate balanced viewpoints
- **Progress Tracking**: Monitor thought challenging journey

##### 🔍 Burns Depression Inventory (BDI) Assessment
- **Clinical Assessment**: Standardized depression screening tool
- **21-Question Format**: Comprehensive mood evaluation
- **Instant Scoring**: Immediate results with interpretation
- **Severity Levels**: Clear categorization (Minimal, Mild, Moderate, Severe)
- **CBT Recommendations**: Personalized suggestions based on score
- **History Tracking**: Monitor assessment scores over time

#### 🆘 **Crisis Mode**
- **Immediate Access**: Floating SOS button always available
- **Emergency Exercises**:
  - **5-4-3-2-1 Grounding**: Sensory awareness technique
  - **Box Breathing**: 4-4-4-4 breathing pattern with visual guide
  - **Self-Soothing Statements**: Positive affirmations
- **Emergency Contacts**: Quick access to crisis hotlines
- **Guided Support**: Step-by-step crisis management
- **No Login Required**: Accessible even without authentication

#### 🎤 **Voice Features**

##### Voice Input
- **Speech-to-Text**: Real-time transcription using Web Speech API
- **Emotion Detection**: AI analysis of voice patterns for emotional state
- **Multilingual Support**: Multiple language recognition
- **Hands-Free Operation**: Accessibility-focused design

##### Voice Output (Text-to-Speech)
- **Natural Voices**: ElevenLabs integration for high-quality TTS
- **Multiple Voice Options**: Choose from various voice profiles
- **Adjustable Speed**: Control playback rate
- **Streaming Audio**: Real-time audio generation
- **Fallback Support**: Browser TTS when API unavailable

#### 📊 **Analytics & Insights**

##### Mood Analytics
- **Visual Charts**: Chart.js powered mood visualization
- **Trend Analysis**: Weekly, monthly, and yearly patterns
- **Mood Distribution**: Pie charts showing mood frequency
- **Streak Tracking**: Consecutive days of mood logging
- **Export Data**: Download mood history as CSV

##### AI Insights
- **Pattern Recognition**: AI-powered mood pattern analysis
- **Personalized Recommendations**: Tailored exercise suggestions
- **Progress Reports**: Weekly and monthly summaries
- **Trigger Identification**: Common mood trigger detection
- **Goal Tracking**: Monitor wellness objectives

#### 🎮 **Gamification**
- **Calm Points System**: Earn points for completing exercises
- **Streak Counter**: Track consecutive days of engagement
- **Level Progression**: Unlock new features and content
- **Achievement Badges**: Visual rewards for milestones

#### 🔍 **Therapist Finder**
- **Location-Based Search**: Find therapists near you
- **Filter Options**: Specialization, insurance, language
- **Therapist Profiles**: Detailed information and credentials
- **Booking Integration**: Direct appointment scheduling

#### 🌐 **Accessibility Features**
- **High Contrast Mode**: Enhanced visibility
- **Font Size Adjustment**: Customizable text size
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Reduced Motion**: Respect user preferences
- **Color Blind Friendly**: Accessible color schemes

---

### Backend Functions

All Firebase Cloud Functions are deployed in the `asia-south1` (Mumbai) region.

#### 💬 **Chat Functions**

##### `chat`
- **Purpose**: Basic AI chat functionality
- **Model**: Google Gemini 2.0 Flash
- **Endpoint**: `POST /chat`
- **Input**: `{ message: string, moodHistory?: array, userProgress?: object }`
- **Output**: `{ response: string, timestamp: string }`

##### `chatPersonalized`
- **Purpose**: Personalized chat with user context
- **Features**: User profile integration, historical memory, adaptive responses
- **Endpoint**: `POST /chatPersonalized`
- **Input**: `{ userId: string, message: string }`

##### `chatMultilingual`
- **Purpose**: Multi-language chat support
- **Features**: Auto language detection, regional language support
- **Endpoint**: `POST /chatMultilingual`

#### 🎙️ **Speech Functions**

##### `speechToText`
- **Purpose**: Convert audio to text
- **Endpoint**: `POST /speechToText`
- **Input**: `{ audioData: base64, format: string }`

##### `textToSpeech`
- **Purpose**: Generate natural speech from text
- **Features**: ElevenLabs integration, multiple voices
- **Endpoint**: `POST /textToSpeech`

#### 🌍 **Translation Functions**

##### `streamingTranslation`
- **Purpose**: Real-time streaming translation
- **Features**: Server-Sent Events (SSE), chunk-by-chunk translation
- **Endpoint**: `GET /streamingTranslation`

##### `streamingTranslationMetrics`
- **Purpose**: Translation performance metrics
- **Endpoint**: `GET /streamingTranslationMetrics`

#### 📊 **Analytics Functions**

##### `analyzeMood`
- **Purpose**: AI-powered mood pattern analysis
- **Endpoint**: `POST /analyzeMood`

##### `getAnalyticsDashboard`
- **Purpose**: Retrieve aggregated analytics
- **Endpoint**: `GET /getAnalyticsDashboard`

##### `getUserInsights`
- **Purpose**: Generate personalized user insights
- **Endpoint**: `GET /getUserInsights`

##### `getUserContext`
- **Purpose**: Retrieve comprehensive user context for AI
- **Endpoint**: `GET /getUserContext`

---

## 🛠 Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI framework |
| **Vite** | 6.3.5 | Build tool & dev server |
| **TailwindCSS** | 3.4.17 | Utility-first CSS |
| **Framer Motion** | 11.11.17 | Animations |
| **Chart.js** | 4.4.6 | Data visualization |
| **React Markdown** | 10.1.0 | Markdown rendering |

### Backend & Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **Firebase** | 12.4.0 | Backend platform |
| **Firebase Admin** | 13.5.0 | Server-side SDK |
| **Google Gemini AI** | 0.3.0 | AI/ML model |
| **ElevenLabs** | 1.59.0 | Text-to-speech |
| **Supabase** | 2.39.0 | Database & storage |
| **Socket.io** | 4.8.1 | Real-time communication |

### Development & Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 2.1.9 | Unit testing |
| **Testing Library** | 16.3.0 | Component testing |
| **JSDOM** | 25.0.1 | DOM simulation |

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────┐
│            Client Layer (React)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    UI    │  │ IndexedDB│  │  Service │   │
│  │Components│  │  (Cache) │  │  Worker  │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         Firebase Services Layer             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Firestore │  │ Storage  │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Hosting  │  │Functions │  │   FCM    │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          External Services Layer            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Gemini AI│  │ElevenLabs│  │ Supabase │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Firebase CLI**: v13.0.0 or higher

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/mindmend.git
cd mindmend
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### Step 3: Firebase Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

### Step 4: Environment Configuration

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key

# Voice Services
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Development
VITE_USE_EMULATORS=false
```

---

## ⚙️ Configuration

### Firestore Collections Structure

```
users/
├── {userId}/
│   ├── profile: { displayName, email, photoURL }
│   ├── progress: { completedExercises, calmPoints, streak }
│   ├── moods/
│   │   └── {moodId}: { mood, timestamp, notes }
│   ├── thoughtRecords/
│   │   └── {recordId}: { thought, distortions, response }
│   └── chats/
│       └── {chatId}: { messages[], timestamp }
```

### API Keys Setup

#### Google Gemini AI
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `.env.local`

#### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get API key from dashboard
3. Add to `.env.local`

---

## 🚀 Development

### Start Development Server

```bash
# Start Vite dev server
npm run dev

# App available at http://localhost:5173
```

### Start Firebase Emulators

```bash
# Start all emulators
firebase emulators:start

# Emulator UI: http://localhost:4000
```

### Development with Emulators

Set in `.env.local`:

```env
VITE_USE_EMULATORS=true
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

---

## 📁 Project Structure

```
MindMend/
├── public/                      # Static assets
├── src/
│   ├── components/              # React components
│   │   ├── Assessment/          # BDI assessment
│   │   ├── DistortionLibrary/   # CBT library
│   │   ├── ThoughtRecord/       # Thought records
│   │   ├── AICoach.jsx          # AI chat
│   │   ├── CrisisMode.jsx       # Crisis support
│   │   ├── Home.jsx             # Dashboard
│   │   ├── MoodAnalytics.jsx    # Analytics
│   │   └── ...
│   ├── services/                # Service layer
│   │   ├── authService.js       # Authentication
│   │   ├── geminiService.js     # AI service
│   │   ├── firebaseConfig.js    # Firebase setup
│   │   └── ...
│   ├── utils/                   # Utilities
│   ├── App.jsx                  # Root component
│   └── index.jsx                # Entry point
├── functions/                   # Firebase Functions
│   ├── src/
│   │   ├── chat.js              # Chat functions
│   │   ├── analytics.js         # Analytics
│   │   └── ...
│   └── package.json
├── .env.example                 # Environment template
├── firebase.json                # Firebase config
├── package.json                 # Dependencies
└── vite.config.js               # Vite config
```

---

## 📚 Key Services Explained

### Distortion Detection Service
Located in `src/services/distortionDetection.js`

**Purpose**: AI-powered cognitive distortion identification

**Features**:
- Analyzes user thoughts using Gemini 2.0
- Identifies top 2-3 distortions with confidence scores
- Provides compassionate reframe suggestions
- Fallback to keyword-based detection
- localStorage CRUD operations

**Usage**:
```javascript
import { analyzeThought } from './services/distortionDetection';

const result = await analyzeThought(userThought);
// Returns: { distortions: [], aiSuggestion: string }
```

### Gemini Service
Located in `src/services/geminiService.js`

**Purpose**: Interface with Google Gemini AI

**Features**:
- Chat response generation
- Mood pattern analysis
- Personalized exercise suggestions
- Mental health context integration
- Fallback responses

**Usage**:
```javascript
import { GeminiService } from './services/geminiService';

const response = await GeminiService.generateChatResponse(
  message,
  moodHistory,
  userProgress
);
```

### ElevenLabs TTS Service
Located in `src/services/elevenLabsService.js`

**Purpose**: High-quality text-to-speech

**Features**:
- Multiple voice profiles
- Streaming audio
- Emotion-aware synthesis
- Caching for performance

**Usage**:
```javascript
import { generateSpeech } from './services/elevenLabsService';

const audioUrl = await generateSpeech(text, voiceId);
```

---

## 🔒 Security & Privacy

- **Authentication**: Firebase Authentication with Google Sign-In
- **Data Encryption**: All data encrypted in transit and at rest
- **HIPAA Compliance**: Designed with healthcare privacy in mind
- **No PHI Storage**: Personal health information stored securely
- **User Control**: Users can delete their data anytime

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- **David Burns, M.D.** - "Feeling Good: The New Mood Therapy"
- **Google Gemini AI** - Advanced AI capabilities
- **Firebase** - Backend infrastructure
- **ElevenLabs** - Natural voice synthesis
- **React Community** - Excellent ecosystem

---


## 🆘 Mental Health Resources

If you're experiencing a mental health crisis, please reach out immediately:

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/


---

**⚠️ Disclaimer**: This application is not a substitute for professional mental health treatment. Please consult with a qualified mental health professional for serious mental health concerns.

**👨‍💻 Maintainers**: 
- [GreenHacker](https://github.com/GreenHacker420) (harsh@greenhacker.tech)
- [curiouscoder-cmd](https://github.com/curiouscoder-cmd) (nitya@curiouscoder.live)
