# MindMend - AI-Powered Mental Wellness Platform

A beautiful, minimalistic mental wellness platform built with React and Tailwind CSS, featuring personalized CBT exercises and progress tracking.

## Features

### 🏠 Personalized Onboarding
- Welcoming homepage with mood assessment
- Four mood options: Happy, Anxious, Sad, Stressed
- Intuitive mood selection with visual feedback
- Clean, calming design with soft color palette

### 🧠 Tailored CBT Experience
- Personalized cognitive behavioral therapy exercises based on selected mood
- Multi-step guided exercises including:
  - Breathing exercises with timer
  - Reflection and journaling prompts
  - Grounding techniques (5-4-3-2-1 method)
  - Thought challenging and reframing
  - Self-compassion practices
  - Solution-focused activities

### 📊 Progress Tracking
- Visual progress bars showing completion percentage
- Calm points reward system
- Daily streak tracking
- Weekly activity visualization
- Achievement badges and milestones
- Motivational messages and encouragement

### 🎨 Design Features
- Responsive design that works on all devices
- Calming color palette (soft blues, whites, grays)
- Smooth animations and transitions
- Accessible and intuitive interface
- Clean, minimalistic aesthetic
- Healthcare-appropriate theme

### 🎵 Listen to Calming Music
- Enjoy a calming, royalty-free music track directly from the homepage
- Users can upload their own music file as `public/music.mp3` to personalize the experience

### 🌱 Watch Calming Video
- Watch a peaceful, relaxing video on the homepage to help soothe your mind
- Users can upload their own video file as `public/plant.mp4` for a custom experience

## Technology Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 6.3.5 (Vite + React for fast development and modern build tooling)
- **Styling**: Tailwind CSS 3.4.0
- **Icons**: Emoji-based for universal compatibility
- **Fonts**: Inter font family for clean readability

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MindMend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
MindMend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── Navigation.js   # Navigation bar component
│   │   ├── Onboarding.js   # Mood selection homepage
│   │   ├── CBTExercise.js  # CBT exercise components
│   │   └── ProgressTracking.js # Progress visualization
│   ├── App.js              # Main application component
│   ├── index.js            # React entry point
│   └── index.css           # Tailwind CSS and custom styles
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Project dependencies
```

## Key Components

### Onboarding Component
- Mood selection interface
- Feature preview cards
- Welcoming introduction to the platform

### CBT Exercise Component
- Dynamic exercise content based on mood
- Multi-step guided experiences
- Interactive elements (timers, text inputs)
- Progress indicators

### Progress Tracking Component
- Statistics overview
- Weekly activity calendar
- Achievement system
- Motivational messaging

## Customization

### Colors
The color palette can be customized in `tailwind.config.js`:
- `primary`: Blue tones for main actions
- `calm`: Gray tones for neutral elements

### Exercises
CBT exercises can be modified in the `CBTExercise.js` component by updating the `exercises` object.

### Achievements
Achievement criteria can be adjusted in the `ProgressTracking.js` component.

### Calming Music & Video
- To use your own music, upload an MP3 file as `public/music.mp3`
- To use your own video, upload an MP4 file as `public/plant.mp4`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built with Create React App
- Styled with Tailwind CSS
- Inspired by evidence-based CBT practices
- Designed for mental wellness and accessibility
