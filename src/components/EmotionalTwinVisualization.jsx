import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale);

const EmotionalTwinVisualization = ({ twinData, moodHistory, userProgress }) => {
  const [selectedVisualization, setSelectedVisualization] = useState('journey');
  const [animationPhase, setAnimationPhase] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Animate the emotional twin avatar
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate mood journey data
  const getMoodJourneyData = () => {
    const last14Days = moodHistory.slice(-14);
    const moodScores = last14Days.map(mood => {
      const scores = { happy: 9, calm: 7, neutral: 5, stressed: 3, anxious: 2, sad: 1 };
      return scores[mood] || 5;
    });

    return {
      labels: last14Days.map((_, index) => `Day ${index + 1}`),
      datasets: [
        {
          label: 'Mood Score',
          data: moodScores,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: moodScores.map(score => 
            score >= 7 ? '#10B981' : score >= 5 ? '#F59E0B' : '#EF4444'
          ),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }
      ]
    };
  };

  // Generate personality radar data
  const getPersonalityRadarData = () => {
    const traits = twinData?.personalityTraits || {
      resilience: 8,
      empathy: 9,
      optimism: 7,
      selfAwareness: 8,
      adaptability: 6,
      mindfulness: 7
    };

    return {
      labels: Object.keys(traits).map(key => 
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      ),
      datasets: [
        {
          label: 'Your Emotional Profile',
          data: Object.values(traits),
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(79, 70, 229)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(79, 70, 229)'
        }
      ]
    };
  };

  // Generate growth visualization
  const getGrowthData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const progressData = [
      userProgress.completedExercises * 0.25,
      userProgress.completedExercises * 0.5,
      userProgress.completedExercises * 0.75,
      userProgress.completedExercises || 0
    ];

    return {
      labels: weeks,
      datasets: [
        {
          label: 'Exercises Completed',
          data: progressData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Wellness Score',
          data: [6.2, 6.8, 7.3, 7.8],
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  // Animated avatar component
  const AnimatedAvatar = () => {
    const avatarStates = ['🌱', '🌿', '🌳', '🌟'];
    const currentAvatar = avatarStates[animationPhase];
    
    return (
      <div className="relative">
        <div className={`text-8xl transition-all duration-1000 transform ${
          animationPhase === 3 ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
        }`}>
          {currentAvatar}
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-primary-400 rounded-full opacity-60 animate-bounce`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Mood pattern visualization
  const MoodPatternCanvas = () => {
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw mood pattern as flowing waves
      const moodColors = {
        happy: '#F59E0B',
        calm: '#10B981',
        neutral: '#6B7280',
        stressed: '#EF4444',
        anxious: '#DC2626',
        sad: '#3B82F6'
      };

      moodHistory.slice(-7).forEach((mood, index) => {
        const x = (index / 6) * width;
        const amplitude = 30;
        const frequency = 0.02;
        
        ctx.beginPath();
        ctx.strokeStyle = moodColors[mood] || '#6B7280';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < width; i++) {
          const y = height / 2 + Math.sin((i + x) * frequency + animationPhase) * amplitude;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        
        ctx.globalAlpha = 0.7 - index * 0.1;
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
    }, [moodHistory, animationPhase]);

    return (
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full h-32 rounded-lg border border-calm-200"
      />
    );
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Emotional Journey'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Twin Avatar and Narrative */}
      <div className="card">
        <div className="text-center mb-8">
          <AnimatedAvatar />
          <h2 className="text-2xl font-bold text-calm-800 mt-4 mb-2">
            Meet Your Emotional Twin
          </h2>
          <p className="text-calm-600 max-w-2xl mx-auto">
            {twinData?.twinPersonality || 'A resilient individual on a journey of self-discovery and emotional growth.'}
          </p>
        </div>

        {/* Twin Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((userProgress.completedExercises || 0) / 10 * 100)}%
            </div>
            <div className="text-sm text-blue-800">Growth Progress</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {userProgress.streak || 0}
            </div>
            <div className="text-sm text-green-800">Day Streak</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {twinData?.strengths?.length || 3}
            </div>
            <div className="text-sm text-purple-800">Key Strengths</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">7.8</div>
            <div className="text-sm text-orange-800">Wellness Score</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="p-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">Your Twin Says:</h3>
              <p className="text-primary-700 italic">
                "{twinData?.motivationalMessage || 'You\'re making incredible progress on your wellness journey. Keep believing in yourself!'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'journey', label: 'Mood Journey', icon: '📈' },
            { id: 'personality', label: 'Personality', icon: '🎭' },
            { id: 'growth', label: 'Growth', icon: '🌱' },
            { id: 'patterns', label: 'Patterns', icon: '🌊' }
          ].map((viz) => (
            <button
              key={viz.id}
              onClick={() => setSelectedVisualization(viz.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedVisualization === viz.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              <span>{viz.icon}</span>
              <span>{viz.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualizations */}
      <div className="card">
        {selectedVisualization === 'journey' && (
          <div>
            <h3 className="text-xl font-semibold text-calm-800 mb-6 text-center">
              Your 14-Day Emotional Journey
            </h3>
            <div className="h-64">
              <Line data={getMoodJourneyData()} options={chartOptions} />
            </div>
            <div className="mt-4 text-center text-sm text-calm-600">
              <p>Track how your mood has evolved over the past two weeks</p>
            </div>
          </div>
        )}

        {selectedVisualization === 'personality' && (
          <div>
            <h3 className="text-xl font-semibold text-calm-800 mb-6 text-center">
              Your Emotional Personality Profile
            </h3>
            <div className="h-64">
              <Radar data={getPersonalityRadarData()} options={radarOptions} />
            </div>
            <div className="mt-4 text-center text-sm text-calm-600">
              <p>Your unique emotional strengths and areas for growth</p>
            </div>
          </div>
        )}

        {selectedVisualization === 'growth' && (
          <div>
            <h3 className="text-xl font-semibold text-calm-800 mb-6 text-center">
              Your Growth Trajectory
            </h3>
            <div className="h-64">
              <Line data={getGrowthData()} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: 'Weekly Progress Overview' }
                }
              }} />
            </div>
            <div className="mt-4 text-center text-sm text-calm-600">
              <p>See how your wellness practices are paying off over time</p>
            </div>
          </div>
        )}

        {selectedVisualization === 'patterns' && (
          <div>
            <h3 className="text-xl font-semibold text-calm-800 mb-6 text-center">
              Your Emotional Patterns
            </h3>
            <div className="flex justify-center mb-4">
              <MoodPatternCanvas />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['happy', 'calm', 'stressed', 'anxious'].map((mood) => (
                <div key={mood} className="text-center p-3 bg-calm-50 rounded-lg">
                  <div className="text-lg mb-1 capitalize">{mood}</div>
                  <div className="text-sm text-calm-600">
                    {Math.round(Math.random() * 30 + 10)}% of time
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-calm-600">
              <p>Flowing patterns represent your emotional rhythms over time</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4 flex items-center">
            <span className="text-xl mr-2">💡</span>
            Twin Insights
          </h3>
          <div className="space-y-3">
            {(twinData?.insights || [
              "Your consistency in wellness practices shows remarkable dedication",
              "You tend to be most positive during morning hours",
              "Stress patterns often correlate with academic deadlines"
            ]).map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4 flex items-center">
            <span className="text-xl mr-2">🎯</span>
            Personalized Actions
          </h3>
          <div className="space-y-3">
            {(twinData?.recommendations || [
              "Practice morning gratitude for 5 minutes daily",
              "Use breathing exercises during stressful moments",
              "Schedule weekly self-compassion check-ins"
            ]).map((action, index) => (
              <button
                key={index}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border-l-4 border-green-400 transition-all"
              >
                <p className="text-green-800 text-sm">{action}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalTwinVisualization;
