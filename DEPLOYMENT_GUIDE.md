# MindMend AI - Deployment Guide for Google Gen AI Hackathon

## 🚀 Quick Deployment to Netlify

### Prerequisites
1. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Node.js 18+**: Ensure you have Node.js installed

### Step 1: Environment Setup
```bash
# Clone the repository
git clone https://github.com/GreenHacker420/MindMend.git
cd MindMend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env
echo "VITE_GEMINI_API_KEY=your_actual_api_key_here" > .env
```

### Step 2: Local Development
```bash
# Start development server
npm run dev

# Test the application
# Visit http://localhost:5173
```

### Step 3: Deploy to Netlify

#### Option A: Netlify CLI (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Set environment variables
netlify env:set GEMINI_API_KEY your_actual_api_key_here
```

#### Option B: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com) and login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
6. Deploy!

### Step 4: Verify Deployment
- ✅ Check if the site loads
- ✅ Test AI Chat functionality
- ✅ Verify Voice Input works
- ✅ Test Emotional Twin feature
- ✅ Confirm offline mode works

---

## 🎯 Hackathon Presentation Features

### ✅ Implemented Features

#### Core Features
- [x] **Personalized Onboarding** - Mood-based entry point
- [x] **CBT Exercises** - Evidence-based therapeutic activities
- [x] **Progress Tracking** - Gamified wellness journey
- [x] **Crisis Support** - Immediate help resources
- [x] **Community Features** - Peer support system

#### 🚀 **Google Gemini AI-Powered Features**

1. **🤖 AI Coach (Mira)**
   - Real-time chat with empathetic AI
   - Culturally sensitive for Indian youth
   - CBT-based responses using Gemini 2.5 Flash

2. **🌱 Emotional Twin**
   - AI-generated digital representation of emotional patterns
   - Personalized insights and growth recommendations
   - Visual mood journey tracking

3. **🎤 Voice & Emotion Input**
   - Speech-to-text with emotional analysis
   - Real-time stress level detection
   - Proactive intervention suggestions

4. **🎨 Emoji + Doodle Recognition**
   - Multi-modal mood expression
   - Canvas-based emotional drawing
   - AI analysis of color and pattern choices

5. **👥 AI Group Therapy Simulation**
   - Multi-perspective AI conversations
   - Simulated therapist + peer interactions
   - Topic-based group sessions

6. **📱 Offline-First Mode**
   - 6+ CBT exercises available offline
   - Local data storage with sync
   - Progressive Web App capabilities

### 🎪 Demo Flow for Judges

1. **Start**: Show homepage with mood selection
2. **Voice Demo**: Use voice input to express feelings
3. **AI Chat**: Demonstrate Mira's empathetic responses
4. **Emotional Twin**: Show personalized AI insights
5. **Doodle Mode**: Draw emotions and get AI analysis
6. **Group Therapy**: Join AI-simulated group session
7. **Offline Mode**: Disconnect internet, show offline features
8. **Crisis Mode**: Demonstrate immediate support features

---

## 🏆 Competitive Advantages

### Technical Innovation
- **Serverless Architecture**: Netlify Functions for scalability
- **Offline-First**: Works without internet connection
- **Multi-Modal AI**: Voice, text, and visual input processing
- **Real-time Analysis**: Instant emotional state detection

### Cultural Sensitivity
- **Indian Youth Focus**: Addresses academic and social pressure
- **Culturally Aware AI**: Responses tailored for Indian context
- **Family Dynamics**: Understands cultural expectations
- **Stigma Reduction**: Private, judgment-free environment

### Mental Health Impact
- **Evidence-Based**: CBT techniques and mindfulness practices
- **Preventive Care**: Early intervention before crisis
- **Accessibility**: 24/7 availability, no appointment needed
- **Gamification**: Makes mental health engaging

---

## 📊 Technical Architecture

### Frontend Stack
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **IndexedDB** - Offline data storage

### AI Integration
- **Google Gemini 2.5 Flash** - Primary AI model
- **Netlify Functions** - Serverless API endpoints
- **Web Speech API** - Voice recognition
- **Canvas API** - Drawing and visual analysis

### Deployment
- **Netlify** - Static site hosting with functions
- **Progressive Web App** - Installable mobile experience
- **Service Worker** - Offline functionality
- **Environment Variables** - Secure API key management

---

## 🔒 Security & Privacy

### Data Protection
- **Local-First**: Sensitive data stored locally
- **Encrypted Transit**: HTTPS for all communications
- **No Personal Data Storage**: Anonymous usage patterns only
- **GDPR Compliant**: User data control and deletion

### API Security
- **Environment Variables**: API keys secured
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitized user inputs
- **Error Handling**: Graceful failure modes

---

## 📈 Scalability & Future Roadmap

### Phase 1 (Current - Hackathon MVP)
- ✅ Core AI features with Gemini integration
- ✅ Offline-first architecture
- ✅ Multi-modal input processing
- ✅ Cultural sensitivity for Indian users

### Phase 2 (Post-Hackathon)
- [ ] **Real-time Peer Matching**: Connect users with similar challenges
- [ ] **Professional Integration**: Licensed therapist consultations
- [ ] **Advanced Analytics**: Longitudinal mental health insights
- [ ] **Mobile Apps**: Native iOS and Android applications

### Phase 3 (Scale)
- [ ] **Multi-language Support**: Regional Indian languages
- [ ] **Enterprise Version**: For educational institutions
- [ ] **Research Platform**: Anonymized data for mental health research
- [ ] **Global Expansion**: Adapt for other cultural contexts

---

## 🎯 Hackathon Judging Criteria Alignment

### Innovation (25%)
- **Novel AI Applications**: Emotional Twin, Multi-modal input
- **Technical Creativity**: Offline-first with AI integration
- **Unique Features**: AI Group Therapy simulation

### Technical Implementation (25%)
- **Google AI Integration**: Extensive use of Gemini 2.5 Flash
- **Code Quality**: Clean, maintainable React architecture
- **Performance**: Fast loading, responsive design

### Impact & Usefulness (25%)
- **Real Problem**: Mental health crisis in Indian youth
- **Measurable Impact**: Reduced stigma, increased help-seeking
- **Scalability**: Architecture supports millions of users

### Presentation & Demo (25%)
- **Clear Value Prop**: "Mental health from taboo to habit"
- **Compelling Demo**: Multi-feature showcase
- **Professional Delivery**: Polished UI/UX

---

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### API Key Issues
```bash
# Verify environment variable
echo $GEMINI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

#### Netlify Function Errors
- Check function logs in Netlify dashboard
- Verify CORS headers are set
- Ensure API key is set in Netlify environment

### Performance Optimization
- Enable Netlify's asset optimization
- Use Netlify's CDN for global distribution
- Implement service worker for caching

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/GreenHacker420/MindMend/issues)
- **Email**: harsh@greenhacker.tech
- **Demo Site**: [Live Demo](https://mindmend-ai.netlify.app)

---

## 🏅 Hackathon Submission Checklist

- [x] **Working Demo**: Deployed and accessible
- [x] **Source Code**: Clean, documented, on GitHub
- [x] **Google AI Integration**: Extensive Gemini usage
- [x] **Innovation**: Multiple unique AI features
- [x] **Documentation**: Comprehensive guides and README
- [x] **Presentation Ready**: Demo flow prepared
- [x] **Impact Focus**: Addresses real mental health needs

**Ready for Judging! 🚀**
