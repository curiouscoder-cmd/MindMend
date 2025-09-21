import React, { useState, useEffect, useRef } from 'react';
import { mockData } from '../data/mockData';
import elevenLabsService from '../services/elevenLabsService';

const EnhancedCrisisMode = ({ onClose, onExerciseComplete, userLocation }) => {
  const [currentStep, setCurrentStep] = useState('assessment');
  const [urgencyLevel, setUrgencyLevel] = useState(null);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const audioRef = useRef(null);

  // Crisis assessment questions
  const assessmentQuestions = [
    {
      id: 'immediate_danger',
      question: 'Are you in immediate physical danger?',
      type: 'yes_no',
      critical: true
    },
    {
      id: 'self_harm_thoughts',
      question: 'Are you having thoughts of hurting yourself?',
      type: 'yes_no',
      critical: true
    },
    {
      id: 'suicide_thoughts',
      question: 'Are you thinking about ending your life?',
      type: 'yes_no',
      critical: true
    },
    {
      id: 'panic_level',
      question: 'How intense is your distress right now?',
      type: 'scale',
      scale: { min: 1, max: 10, labels: ['Mild', 'Moderate', 'Severe', 'Extreme'] },
      critical: false
    }
  ];

  const [assessmentAnswers, setAssessmentAnswers] = useState({});

  useEffect(() => {
    // Load user's emergency contacts from local storage
    const savedContacts = localStorage.getItem('mindmend_emergency_contacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }

    // Auto-play calming audio
    playCalmingAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playCalmingAudio = async () => {
    try {
      const calmingMessage = "You're safe now. Take a deep breath with me. You're going to be okay.";
      const audioUrl = await elevenLabsService.generateSpeech(calmingMessage, 'meditation');
      
      if (audioUrl && audioUrl !== 'browser_tts') {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.volume = 0.7;
        audioRef.current.loop = false;
        audioRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error playing calming audio:', error);
    }
  };

  const handleAssessmentAnswer = (questionId, answer) => {
    const newAnswers = { ...assessmentAnswers, [questionId]: answer };
    setAssessmentAnswers(newAnswers);

    // Check for critical responses
    const question = assessmentQuestions.find(q => q.id === questionId);
    if (question.critical && answer === 'yes') {
      setUrgencyLevel('critical');
      setCurrentStep('emergency');
      return;
    }

    // Calculate urgency based on all answers
    const urgency = calculateUrgency(newAnswers);
    setUrgencyLevel(urgency);

    // Move to next step if assessment is complete
    if (Object.keys(newAnswers).length === assessmentQuestions.length) {
      setCurrentStep(urgency === 'critical' ? 'emergency' : 'support');
    }
  };

  const calculateUrgency = (answers) => {
    let score = 0;
    
    if (answers.immediate_danger === 'yes') score += 10;
    if (answers.self_harm_thoughts === 'yes') score += 8;
    if (answers.suicide_thoughts === 'yes') score += 10;
    if (answers.panic_level >= 8) score += 6;
    else if (answers.panic_level >= 6) score += 4;
    else if (answers.panic_level >= 4) score += 2;

    if (score >= 10) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'moderate';
    return 'low';
  };

  const handleEmergencyCall = (service) => {
    setIsConnecting(true);
    
    // In a real app, this would initiate an actual call
    setTimeout(() => {
      setIsConnecting(false);
      if (service.type === 'emergency') {
        window.open(`tel:${service.number}`, '_self');
      } else {
        alert(`Connecting you to ${service.name}. Please hold on.`);
      }
    }, 2000);
  };

  const startBreathingExercise = async () => {
    setBreathingActive(true);
    setBreathingCount(0);

    // Voice-guided breathing
    const breathingInstructions = [
      "Let's breathe together. Breathe in slowly for 4 counts.",
      "Hold your breath for 4 counts.",
      "Now breathe out slowly for 6 counts.",
      "You're doing great. Let's do this again."
    ];

    for (let i = 0; i < 4; i++) {
      for (const instruction of breathingInstructions) {
        if (!breathingActive) break;
        
        try {
          const audioUrl = await elevenLabsService.generateSpeech(instruction, 'meditation');
          if (audioUrl && audioUrl !== 'browser_tts') {
            const audio = new Audio(audioUrl);
            audio.volume = 0.8;
            await audio.play();
            
            // Wait for audio to finish
            await new Promise(resolve => {
              audio.onended = resolve;
              setTimeout(resolve, 5000); // Fallback timeout
            });
          }
        } catch (error) {
          console.error('Error playing breathing instruction:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setBreathingCount(i + 1);
    }

    setBreathingActive(false);
    if (onExerciseComplete) {
      onExerciseComplete();
    }
  };

  const emergencyServices = [
    {
      id: 'emergency',
      name: 'Emergency Services',
      number: '112',
      description: 'Immediate emergency response',
      type: 'emergency',
      icon: '🚨',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'suicide_prevention',
      name: 'Suicide Prevention Helpline',
      number: '91-22-27546669',
      description: 'AASRA - 24/7 suicide prevention',
      type: 'crisis',
      icon: '🆘',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'mental_health',
      name: 'Mental Health Helpline',
      number: '91-44-24640050',
      description: 'Sneha India - Mental health support',
      type: 'support',
      icon: '💚',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const supportOptions = [
    {
      id: 'breathing',
      title: 'Guided Breathing',
      description: 'Voice-guided breathing exercise to calm your nervous system',
      icon: '🫁',
      action: startBreathingExercise,
      duration: '5 minutes'
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Grounding technique to bring you back to the present',
      icon: '🌱',
      action: () => setSelectedSupport('grounding'),
      duration: '3 minutes'
    },
    {
      id: 'emergency_contact',
      title: 'Call Emergency Contact',
      description: 'Reach out to someone you trust',
      icon: '📞',
      action: () => setSelectedSupport('contact'),
      duration: 'Immediate'
    },
    {
      id: 'professional',
      title: 'Connect with Professional',
      description: 'Speak with a licensed mental health professional',
      icon: '👨‍⚕️',
      action: () => setSelectedSupport('professional'),
      duration: '15-30 minutes'
    }
  ];

  const GroundingExercise = () => {
    const [step, setStep] = useState(0);
    const groundingSteps = [
      { instruction: "Name 5 things you can see around you", sense: "sight", icon: "👀" },
      { instruction: "Name 4 things you can touch", sense: "touch", icon: "✋" },
      { instruction: "Name 3 things you can hear", sense: "hearing", icon: "👂" },
      { instruction: "Name 2 things you can smell", sense: "smell", icon: "👃" },
      { instruction: "Name 1 thing you can taste", sense: "taste", icon: "👅" }
    ];

    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold text-calm-800 mb-6">5-4-3-2-1 Grounding Exercise</h3>
        
        <div className="mb-8">
          <div className="text-6xl mb-4">{groundingSteps[step].icon}</div>
          <p className="text-lg text-calm-700 mb-6">{groundingSteps[step].instruction}</p>
          
          <div className="flex justify-center space-x-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            
            {step < groundingSteps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedSupport(null);
                  if (onExerciseComplete) onExerciseComplete();
                }}
                className="btn-primary"
              >
                Complete
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {groundingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= step ? 'bg-primary-500' : 'bg-calm-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const AssessmentStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-calm-800 mb-6">Crisis Assessment</h2>
      <p className="text-calm-600 mb-8">Help us understand how to best support you right now.</p>

      <div className="space-y-6">
        {assessmentQuestions.map((question, index) => (
          <div key={question.id} className="card text-left">
            <h3 className="text-lg font-semibold text-calm-800 mb-4">
              {index + 1}. {question.question}
            </h3>

            {question.type === 'yes_no' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAssessmentAnswer(question.id, 'yes')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    assessmentAnswers[question.id] === 'yes'
                      ? 'bg-red-500 text-white'
                      : 'bg-calm-100 text-calm-700 hover:bg-calm-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAssessmentAnswer(question.id, 'no')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    assessmentAnswers[question.id] === 'no'
                      ? 'bg-green-500 text-white'
                      : 'bg-calm-100 text-calm-700 hover:bg-calm-200'
                  }`}
                >
                  No
                </button>
              </div>
            )}

            {question.type === 'scale' && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-calm-600">
                  <span>{question.scale.labels[0]}</span>
                  <span>{question.scale.labels[question.scale.labels.length - 1]}</span>
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: question.scale.max }, (_, i) => i + 1).map(value => (
                    <button
                      key={value}
                      onClick={() => handleAssessmentAnswer(question.id, value)}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        assessmentAnswers[question.id] === value
                          ? value <= 3 ? 'bg-green-500 text-white' :
                            value <= 6 ? 'bg-yellow-500 text-white' :
                            value <= 8 ? 'bg-orange-500 text-white' :
                            'bg-red-500 text-white'
                          : 'bg-calm-100 text-calm-700 hover:bg-calm-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const EmergencyStep = () => (
    <div className="text-center">
      <div className="text-6xl mb-4">🚨</div>
      <h2 className="text-2xl font-bold text-red-800 mb-4">Immediate Help Needed</h2>
      <p className="text-red-700 mb-8">
        Based on your responses, we recommend immediate professional support. 
        You don't have to go through this alone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {emergencyServices.map(service => (
          <button
            key={service.id}
            onClick={() => handleEmergencyCall(service)}
            disabled={isConnecting}
            className={`p-6 rounded-lg text-white font-semibold transition-all ${service.color} disabled:opacity-50`}
          >
            <div className="text-3xl mb-2">{service.icon}</div>
            <div className="text-lg mb-2">{service.name}</div>
            <div className="text-sm opacity-90">{service.description}</div>
            <div className="text-lg font-bold mt-2">{service.number}</div>
          </button>
        ))}
      </div>

      {isConnecting && (
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
          <span>Connecting...</span>
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Remember:</strong> If you're in immediate danger, call emergency services (112) right away.
          These helplines are staffed by trained professionals who want to help.
        </p>
      </div>
    </div>
  );

  const SupportStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-calm-800 mb-6">Crisis Support Options</h2>
      <p className="text-calm-600 mb-8">Choose the type of support that feels right for you right now.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportOptions.map(option => (
          <button
            key={option.id}
            onClick={option.action}
            className="card text-left hover:shadow-lg transition-all p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-calm-800 mb-2">{option.title}</h3>
                <p className="text-calm-600 text-sm mb-3">{option.description}</p>
                <div className="text-primary-600 text-sm font-medium">
                  Duration: {option.duration}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-calm-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🆘</div>
            <div>
              <h1 className="text-xl font-bold text-calm-800">Crisis Support</h1>
              <p className="text-sm text-calm-600">Immediate help and resources</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-calm-500 hover:text-calm-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'assessment' && <AssessmentStep />}
          {currentStep === 'emergency' && <EmergencyStep />}
          {currentStep === 'support' && !selectedSupport && <SupportStep />}
          {selectedSupport === 'grounding' && <GroundingExercise />}
          
          {selectedSupport === 'breathing' && breathingActive && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-calm-800 mb-6">Guided Breathing Exercise</h3>
              <div className="text-6xl mb-4">🫁</div>
              <p className="text-lg text-calm-700 mb-4">
                Breathing cycle {breathingCount + 1} of 4
              </p>
              <div className="animate-pulse text-primary-600">
                Listen to the voice guidance and breathe along...
              </div>
              <button
                onClick={() => setBreathingActive(false)}
                className="mt-6 btn-secondary"
              >
                Stop Exercise
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-calm-200 bg-calm-50">
          <div className="text-center text-sm text-calm-600">
            <p className="mb-2">
              <strong>Crisis Hotlines:</strong> Emergency (112) • Suicide Prevention (91-22-27546669) • Mental Health (91-44-24640050)
            </p>
            <p>
              This tool provides immediate support but is not a replacement for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCrisisMode;
