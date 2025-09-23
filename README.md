# MindMend - AI-Powered Mental Wellness Platform

[![Last Commit](https://img.shields.io/badge/Last%20Commit-2025--09--23-blue.svg)]
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)]
[![Primary Language](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7.svg)](https://minddmend.netlify.app/)

> A beautiful, minimalistic mental wellness platform built with React and Tailwind CSS, featuring personalized CBT exercises and progress tracking.

## 🚀 Technology Stack

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.11.17-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.39.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google AI](https://img.shields.io/badge/Google%20AI-0.3.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.6-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

## 📋 Project Overview

MindMend is a comprehensive mental wellness platform designed to provide users with evidence-based Cognitive Behavioral Therapy (CBT) exercises, mood tracking, and personalized support. The application combines modern web technologies with mental health best practices to create an accessible, user-friendly experience for individuals seeking to improve their mental well-being.

### 🎯 Key Features

#### 🏠 Personalized Onboarding
- Welcoming homepage with mood assessment
- Four mood options: Happy, Anxious, Sad, Stressed
- Intuitive mood selection with visual feedback
- Clean, calming design with soft color palette

#### 🧠 Tailored CBT Experience
- Personalized cognitive behavioral therapy exercises based on selected mood
- Multi-step guided exercises including:
  - Breathing exercises with timer
  - Reflection and journaling prompts
  - Grounding techniques (5-4-3-2-1 method)
  - Thought challenging and reframing
  - Self-compassion practices
  - Solution-focused activities
- **Voice Input Integration**: Express emotions through voice with AI-powered emotion detection
- **Doodle Mood Input**: Draw your feelings and get AI-powered mood analysis
- **Emotional Twin**: AI companion that learns and mirrors your emotional patterns

#### 📊 Progress Tracking & Analytics
- Visual progress bars showing completion percentage
- Calm points reward system
- Daily streak tracking
- Weekly activity visualization
- Achievement badges and milestones
- Motivational messages and encouragement

#### 🎮 Gamification Features
- **Calm Points System**: Earn points for completing exercises
- **Achievement Badges**: Unlock badges for consistency and milestones
- **Level Progression**: Advance through wellness levels
- **Streak Tracking**: Maintain daily practice streaks
- **Community Leaderboard**: Compare progress with others (optional)

#### 👥 Community Support
- **Anonymous Support Groups**: Join topic-based discussion groups
- **Peer Encouragement**: Give and receive support from others
- **Success Stories**: Share and read inspiring recovery journeys
- **Expert Q&A**: Weekly sessions with mental health professionals
- **Crisis Support Network**: 24/7 peer support for urgent situations
- **Community Forums**: Advanced forum system with real-time messaging
- **Micro Communities**: Small, focused support groups for specific needs
- **Voice-Enabled Messaging**: Communicate through voice in community spaces

#### 🤖 AI-Powered Features
- **Personal AI Coach**: Personalized guidance and check-ins with Google AI integration
- **Smart Insights**: AI-driven analysis of mood patterns and triggers
- **Adaptive Recommendations**: Customized exercise suggestions based on progress
- **Crisis Detection**: AI monitoring for signs of mental health crises
- **Intelligent Reminders**: Smart notifications for optimal engagement times
- **AI Group Therapy**: Participate in AI-facilitated group therapy sessions
- **Enhanced AI Insights**: Deep learning analysis of emotional patterns
- **Voice Emotion Recognition**: Real-time emotion detection from voice input
- **Doodle Analysis**: AI interpretation of mood through artistic expression

#### 🆘 Crisis Support Mode
- **Immediate Help Resources**: Quick access to crisis hotlines and emergency contacts
- **Breathing Exercises**: Instant access to calming techniques
- **Grounding Techniques**: 5-4-3-2-1 sensory grounding and other methods
- **Emergency Contacts**: Pre-configured list of trusted contacts
- **Professional Resources**: Direct links to mental health professionals

#### 🎨 Design Features
- Responsive design that works on all devices
- Calming color palette (soft blues, whites, grays)
- Smooth animations and transitions with Framer Motion
- Accessible and intuitive interface with comprehensive accessibility settings
- Clean, minimalistic aesthetic
- Healthcare-appropriate theme
- **Floating Particles**: Beautiful visual effects for enhanced user experience
- **Mood-Based Theming**: Dynamic color schemes that adapt to user's emotional state
- **Offline Support**: Full functionality even without internet connection

#### 🎵 Multimedia Experience
- **Calming Music**: Enjoy royalty-free music tracks directly from the homepage
- **Peaceful Videos**: Watch relaxing videos to help soothe your mind
- **Custom Media**: Upload your own music (`public/music.mp3`) and video (`public/plant.mp4`) files

#### 🗄️ Database & Backend Integration
- **Supabase Integration**: Real-time database with user authentication
- **Offline-First Architecture**: Full functionality without internet connection
- **Data Synchronization**: Seamless sync between offline and online data
- **Database Migrations**: Structured database schema management
- **Real-time Updates**: Live data updates across all connected devices

#### 🔧 Advanced Technical Features
- **Progressive Web App (PWA)**: Install as a native app on any device
- **Service Workers**: Background sync and caching for offline functionality
- **WebRTC Integration**: Real-time communication for group therapy sessions
- **Canvas Confetti**: Celebration animations for achievements
- **IndexedDB Storage**: Client-side database for offline data persistence
- **Socket.io Integration**: Real-time messaging and notifications

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** or **yarn** package manager

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/GreenHacker/MindMend.git
cd MindMend
```

2. **Install dependencies:**
```bash
npm install
# Or use the provided script
./install-dependencies.sh
```

3. **Environment Setup:**
```bash
# Copy the example environment file
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser and navigate to:**
```
http://localhost:5173
```

### Detailed Setup Guides

For comprehensive setup instructions, refer to these additional guides:
- 📋 [Quick Start Guide](QUICK_START.md) - Fast setup for development
- 🗄️ [Database Setup](DATABASE_SETUP.md) - Supabase configuration
- 📦 [Install Dependencies](INSTALL_DEPENDENCIES.md) - Detailed dependency installation
- 💰 [Cost Estimation & Mockups](COST_ESTIMATION_AND_MOCKUPS.md) - Project planning details

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Runs the app in development mode with hot reload |
| `npm run build` | Builds the app for production to the `dist` folder |
| `npm run preview` | Serves the production build locally for testing |
| `npm start` | Alias for `npm run dev` |

### Building for Production

```bash
npm run build
```

The built files will be optimized and placed in the `dist` directory, ready for deployment.

## 📁 Project Structure

```
MindMend/
├── 📁 public/
│   ├── 🎵 music.mp3           # Background music file
│   └── 🎬 plant.mp4           # Calming video file
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 🧭 Navigation.jsx          # Navigation bar component
│   │   ├── 🏠 Onboarding.jsx          # Mood selection homepage
│   │   ├── 🧠 CBTExercise.jsx         # CBT exercise components
│   │   ├── 📊 ProgressTracking.jsx     # Progress visualization
│   │   ├── 🎮 Gamification.jsx        # Gamification features
│   │   ├── 🎮 EnhancedGamification.jsx # Advanced gamification
│   │   ├── 👥 Community.jsx           # Community support features
│   │   ├── 👥 CommunityForums.jsx     # Advanced forum system
│   │   ├── 👥 MicroCommunities.jsx    # Small support groups
│   │   ├── 🤖 AICoach.jsx             # AI coaching component
│   │   ├── 📈 AIInsights.jsx          # AI-powered insights
│   │   ├── 📈 EnhancedAIInsights.jsx  # Advanced AI analysis
│   │   ├── 🎭 EmotionalTwin.jsx       # AI emotional companion
│   │   ├── 🎭 EmotionalTwinVisualization.jsx # Twin visualization
│   │   ├── 📊 MoodAnalytics.jsx       # Mood analytics dashboard
│   │   ├── 🆘 CrisisMode.jsx          # Crisis support mode
│   │   ├── 🆘 EnhancedCrisisMode.jsx  # Advanced crisis support
│   │   ├── 🎤 VoiceInput.jsx          # Voice emotion detection
│   │   ├── 🎤 VoiceEnabledMessage.jsx # Voice messaging
│   │   ├── 🎨 DoodleMoodInput.jsx     # Mood through drawing
│   │   ├── 🏥 AIGroupTherapy.jsx      # AI group therapy sessions
│   │   ├── 🔧 AccessibilityProvider.jsx # Accessibility context
│   │   ├── 🔧 AccessibilitySettings.jsx # Accessibility controls
│   │   ├── 📱 OfflineIndicator.jsx    # Offline status indicator
│   │   ├── 🗄️ DatabaseDemo.jsx       # Database demonstration
│   │   ├── 🗄️ DatabaseStatus.jsx     # Database status monitor
│   │   └── ✨ FloatingParticles.jsx   # Visual effects
│   ├── 📁 hooks/
│   │   └── 🎨 useMoodTheme.js         # Custom hook for mood-based theming
│   ├── 📁 services/
│   │   └── 💾 offlineService.js       # Offline data management
│   ├── 📁 data/
│   │   └── 📊 mockData.js             # Mock data for development
│   ├── 📱 App.jsx                     # Main application component
│   ├── 🚀 main.jsx                   # React entry point
│   └── 🎨 index.css                  # Tailwind CSS and custom styles
├── 📁 supabase/
│   └── 🗄️ migrations/                # Database migrations
├── 📁 netlify/
│   └── ⚙️ functions/                 # Serverless functions
├── ⚙️ tailwind.config.js             # Tailwind CSS configuration
├── ⚙️ postcss.config.js              # PostCSS configuration
├── ⚙️ vite.config.js                 # Vite build configuration
├── ⚙️ netlify.toml                   # Netlify deployment config
├── 📦 package.json                   # Project dependencies and scripts
├── 📄 index.html                     # HTML template
├── 📋 QUICK_START.md                 # Quick start guide
├── 📋 DATABASE_SETUP.md              # Database setup instructions
├── 📋 INSTALL_DEPENDENCIES.md        # Dependency installation guide
└── 📋 COST_ESTIMATION_AND_MOCKUPS.md # Project planning document
```

## 🔧 Configuration & Customization

### Environment Variables
Configure your application using the `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# Application Settings
VITE_APP_NAME=MindMend
VITE_APP_VERSION=1.0.0
```

### Color Themes
Customize the color palette in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fff7ed',
        // ... custom primary colors
      },
      calm: {
        50: '#f9fafb',
        // ... custom calm colors
      },
      accent: {
        50: '#fdf6f0',
        // ... custom accent colors
      }
    }
  }
}
```

### Custom Media Files
- **Music**: Replace `public/music.mp3` with your own calming audio
- **Video**: Replace `public/plant.mp4` with your own peaceful video
- **Supported formats**: MP3 for audio, MP4 for video

### Adding New CBT Exercises
Create new exercise components in `src/components/` and integrate them into the main `CBTExercise.jsx` component.

### Database Configuration
The application uses Supabase for backend services. Database migrations are located in `supabase/migrations/`. To set up the database:

1. Create a Supabase project
2. Run the migrations using the Supabase CLI
3. Configure your environment variables

### Deployment Configuration
The application is configured for Netlify deployment with:
- `netlify.toml` - Deployment configuration
- `netlify/functions/` - Serverless functions
- Automatic builds from the main branch

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest ✅ |
| Firefox | Latest ✅ |
| Safari | Latest ✅ |
| Edge | Latest ✅ |

## 🤝 Contributing

We welcome contributions to MindMend! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Ensure responsive design across all devices
- Write meaningful commit messages
- Test your changes thoroughly


## 🆘 Mental Health Resources

If you're experiencing a mental health crisis, please reach out immediately:

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## 🙏 Acknowledgments

- Built with ❤️ for mental health awareness
- Inspired by evidence-based CBT practices
- Designed with accessibility and user experience in mind
- Special thanks to the mental health community for guidance and feedback

---

**⚠️ Disclaimer**: This application is not a substitute for professional mental health treatment. Please consult with a qualified mental health professional for serious mental health concerns.

**👨‍💻 Maintainers**: 
- [GreenHacker](https://github.com/GreenHacker420) (harsh@greenhacker.tech)
- [curiouscoder-cmd](https://github.com/curiouscoder-cmd) (nitya@curiouscoder.live)

