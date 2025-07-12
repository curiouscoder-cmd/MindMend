# MindMend - AI-Powered Mental Wellness Platform

[![Last Commit](https://img.shields.io/badge/Last%20Commit-2025--07--09-blue.svg)](https://github.com/GreenHacker/MindMend/commit/c09a7be1ebc00c3881a64c8a54bbcfacb3dc07d7)
[![Commit Hash](https://img.shields.io/badge/Hash-c09a7be-lightgrey.svg)](https://github.com/GreenHacker/MindMend/commit/c09a7be1ebc00c3881a64c8a54bbcfacb3dc07d7)
[![Primary Language](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7.svg)](https://minddmend.netlify.app/)

> A beautiful, minimalistic mental wellness platform built with React and Tailwind CSS, featuring personalized CBT exercises and progress tracking.

## 🚀 Technology Stack

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PostCSS](https://img.shields.io/badge/PostCSS-8.5.6-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)
![Autoprefixer](https://img.shields.io/badge/Autoprefixer-10.4.21-DD3735?style=for-the-badge&logo=autoprefixer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-14+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-Package%20Manager-CB3837?style=for-the-badge&logo=npm&logoColor=white)

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

#### 🤖 AI-Powered Features
- **Personal AI Coach**: Personalized guidance and check-ins
- **Smart Insights**: AI-driven analysis of mood patterns and triggers
- **Adaptive Recommendations**: Customized exercise suggestions based on progress
- **Crisis Detection**: AI monitoring for signs of mental health crises
- **Intelligent Reminders**: Smart notifications for optimal engagement times

#### 🆘 Crisis Support Mode
- **Immediate Help Resources**: Quick access to crisis hotlines and emergency contacts
- **Breathing Exercises**: Instant access to calming techniques
- **Grounding Techniques**: 5-4-3-2-1 sensory grounding and other methods
- **Emergency Contacts**: Pre-configured list of trusted contacts
- **Professional Resources**: Direct links to mental health professionals

#### 🎨 Design Features
- Responsive design that works on all devices
- Calming color palette (soft blues, whites, grays)
- Smooth animations and transitions
- Accessible and intuitive interface
- Clean, minimalistic aesthetic
- Healthcare-appropriate theme

#### 🎵 Multimedia Experience
- **Calming Music**: Enjoy royalty-free music tracks directly from the homepage
- **Peaceful Videos**: Watch relaxing videos to help soothe your mind
- **Custom Media**: Upload your own music (`public/music.mp3`) and video (`public/plant.mp4`) files

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
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and navigate to:**
```
http://localhost:3000
```

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
│   │   ├── 🧭 Navigation.jsx      # Navigation bar component
│   │   ├── 🏠 Onboarding.jsx      # Mood selection homepage
│   │   ├── 🧠 CBTExercise.jsx     # CBT exercise components
│   │   ├── 📊 ProgressTracking.jsx # Progress visualization
│   │   ├── 🎮 Gamification.jsx    # Gamification features
│   │   ├── 👥 Community.jsx       # Community support features
│   │   ├── 🤖 AICoach.jsx         # AI coaching component
│   │   ├── 📈 AIInsights.jsx      # AI-powered insights
│   │   ├── 📊 MoodAnalytics.jsx   # Mood analytics dashboard
│   │   ├── 🆘 CrisisMode.jsx      # Crisis support mode
│   │   └── ✨ FloatingParticles.jsx # Visual effects
│   ├── 📁 hooks/
│   │   └── 🎨 useMoodTheme.js     # Custom hook for mood-based theming
│   ├── 📱 App.jsx              # Main application component
│   ├── 🚀 index.jsx            # React entry point
│   └── 🎨 index.css            # Tailwind CSS and custom styles
├── ⚙️ tailwind.config.js       # Tailwind CSS configuration
├── ⚙️ postcss.config.js        # PostCSS configuration
├── ⚙️ vite.config.js           # Vite build configuration
├── 📦 package.json             # Project dependencies and scripts
└── 📄 index.html               # HTML template
```

## 🔧 Configuration & Customization

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

