import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

const DoodleMoodInput = ({ onMoodDetected, onDoodleComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [brushSize, setBrushSize] = useState(3);
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [doodleAnalysis, setDoodleAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colors = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const moodEmojis = [
    { emoji: '😊', mood: 'happy', label: 'Happy' },
    { emoji: '😢', mood: 'sad', label: 'Sad' },
    { emoji: '😰', mood: 'anxious', label: 'Anxious' },
    { emoji: '😤', mood: 'stressed', label: 'Stressed' },
    { emoji: '😌', mood: 'calm', label: 'Calm' },
    { emoji: '😴', mood: 'tired', label: 'Tired' },
    { emoji: '😡', mood: 'angry', label: 'Angry' },
    { emoji: '🤔', mood: 'confused', label: 'Confused' },
    { emoji: '😍', mood: 'excited', label: 'Excited' },
    { emoji: '😔', mood: 'disappointed', label: 'Disappointed' },
    { emoji: '🥺', mood: 'vulnerable', label: 'Vulnerable' },
    { emoji: '😎', mood: 'confident', label: 'Confident' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Save initial state
      saveCanvasState();
    }
  }, []);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      const newHistory = canvasHistory.slice(0, historyStep + 1);
      newHistory.push(dataURL);
      setCanvasHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = selectedColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < canvasHistory.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  };

  const toggleEmoji = (emojiData) => {
    setSelectedEmojis(prev => {
      const exists = prev.find(e => e.emoji === emojiData.emoji);
      if (exists) {
        return prev.filter(e => e.emoji !== emojiData.emoji);
      } else {
        return [...prev, emojiData];
      }
    });
  };

  const analyzeDoodleAndEmojis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Convert canvas to base64
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      
      // Create analysis prompt
      const emojiMoods = selectedEmojis.map(e => e.mood).join(', ');
      const prompt = `
        Analyze this combination of emotional expression:
        
        Selected mood emojis: ${selectedEmojis.map(e => `${e.emoji} (${e.mood})`).join(', ')}
        
        Based on the emoji selection and drawing patterns, provide emotional insights:
        
        Return JSON:
        {
          "primaryMood": "dominant emotional state",
          "secondaryMoods": ["other emotions present"],
          "emotionalIntensity": 1-10,
          "insights": "psychological interpretation",
          "recommendations": ["specific suggestions"],
          "colorAnalysis": "meaning of chosen colors",
          "overallAssessment": "comprehensive emotional state"
        }
      `;

      // For now, simulate analysis since we can't actually process the image
      const mockAnalysis = {
        primaryMood: selectedEmojis.length > 0 ? selectedEmojis[0].mood : 'neutral',
        secondaryMoods: selectedEmojis.slice(1, 3).map(e => e.mood),
        emotionalIntensity: Math.min(selectedEmojis.length * 2 + Math.random() * 3, 10),
        insights: `Your choice of ${selectedEmojis.length} emojis suggests a complex emotional state. The combination indicates you're processing multiple feelings simultaneously.`,
        recommendations: [
          'Practice mindful breathing to center yourself',
          'Journal about the different emotions you\'re experiencing',
          'Consider talking to someone you trust about your feelings'
        ],
        colorAnalysis: `The ${selectedColor} color choice reflects your current emotional tone and creative expression.`,
        overallAssessment: 'You\'re showing healthy emotional awareness by expressing your feelings through multiple channels.'
      };

      setDoodleAnalysis(mockAnalysis);
      
      if (onMoodDetected) {
        onMoodDetected(mockAnalysis);
      }
      
      if (onDoodleComplete) {
        onDoodleComplete({
          imageData,
          emojis: selectedEmojis,
          analysis: mockAnalysis
        });
      }
      
    } catch (error) {
      console.error('Error analyzing doodle:', error);
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-calm-800 mb-2">Express Your Mood</h2>
          <p className="text-calm-600">Draw your feelings and select emojis that represent your current emotional state</p>
        </div>

        {/* Emoji Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-calm-800 mb-3 flex items-center">
            <span className="text-xl mr-2">😊</span>
            How are you feeling? (Select all that apply)
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {moodEmojis.map((emojiData, index) => (
              <button
                key={index}
                onClick={() => toggleEmoji(emojiData)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedEmojis.find(e => e.emoji === emojiData.emoji)
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-calm-200 hover:border-calm-300'
                }`}
                title={emojiData.label}
              >
                <div className="text-2xl mb-1">{emojiData.emoji}</div>
                <div className="text-xs text-calm-600">{emojiData.label}</div>
              </button>
            ))}
          </div>
          
          {selectedEmojis.length > 0 && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-800">
                Selected: {selectedEmojis.map(e => e.emoji).join(' ')} 
                <span className="ml-2 text-primary-600">
                  ({selectedEmojis.map(e => e.label).join(', ')})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Drawing Tools */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-calm-800 mb-3 flex items-center">
            <span className="text-xl mr-2">🎨</span>
            Draw Your Feelings
          </h3>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-calm-600">Colors:</span>
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-calm-800 scale-110' : 'border-calm-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Brush Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-calm-600">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
                className="w-20"
              />
              <span className="text-sm text-calm-600 w-6">{brushSize}</span>
            </div>

            {/* Tools */}
            <div className="flex space-x-2">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="px-3 py-1 bg-calm-100 hover:bg-calm-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= canvasHistory.length - 1}
                className="px-3 py-1 bg-calm-100 hover:bg-calm-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
              >
                ↷ Redo
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-calm-300 rounded-lg p-4 bg-calm-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-64 md:h-80 bg-white rounded border cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <p className="text-center text-sm text-calm-600 mt-2">
              Draw freely to express your emotions - there's no right or wrong way!
            </p>
          </div>
        </div>

        {/* Analysis Button */}
        <div className="text-center mb-6">
          <button
            onClick={analyzeDoodleAndEmojis}
            disabled={isAnalyzing || (selectedEmojis.length === 0)}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Analyzing Your Expression...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🧠</span>
                <span>Analyze My Mood Expression</span>
              </span>
            )}
          </button>
          
          {selectedEmojis.length === 0 && (
            <p className="text-sm text-calm-500 mt-2">Select at least one emoji to analyze your mood</p>
          )}
        </div>

        {/* Analysis Results */}
        {doodleAnalysis && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-calm-800 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Your Emotional Expression Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Analysis */}
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <h4 className="font-semibold text-calm-800 mb-2">Primary Mood</h4>
                  <div className="text-2xl mb-1">
                    {moodEmojis.find(e => e.mood === doodleAnalysis.primaryMood)?.emoji || '😊'}
                  </div>
                  <p className="text-calm-700 capitalize font-medium">{doodleAnalysis.primaryMood}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <h4 className="font-semibold text-calm-800 mb-2">Emotional Intensity</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-calm-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          doodleAnalysis.emotionalIntensity <= 3 ? 'bg-green-400' :
                          doodleAnalysis.emotionalIntensity <= 6 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${doodleAnalysis.emotionalIntensity * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-calm-700">
                      {Math.round(doodleAnalysis.emotionalIntensity)}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Moods */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <h4 className="font-semibold text-calm-800 mb-3">Secondary Emotions</h4>
                <div className="space-y-2">
                  {doodleAnalysis.secondaryMoods.map((mood, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-lg">
                        {moodEmojis.find(e => e.mood === mood)?.emoji || '💭'}
                      </span>
                      <span className="text-calm-700 capitalize">{mood}</span>
                    </div>
                  ))}
                  {doodleAnalysis.secondaryMoods.length === 0 && (
                    <p className="text-calm-600 text-sm">Single dominant emotion detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
              <h4 className="font-semibold text-calm-800 mb-3 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Psychological Insights
              </h4>
              <p className="text-calm-700 leading-relaxed mb-4">{doodleAnalysis.insights}</p>
              <p className="text-calm-600 text-sm">{doodleAnalysis.colorAnalysis}</p>
            </div>

            {/* Recommendations */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
              <h4 className="font-semibold text-calm-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🎯</span>
                Personalized Recommendations
              </h4>
              <div className="space-y-2">
                {doodleAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <p className="text-calm-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-calm-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🌟</span>
                Overall Assessment
              </h4>
              <p className="text-calm-700 leading-relaxed">{doodleAnalysis.overallAssessment}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="btn-primary">Start Recommended Exercise</button>
              <button className="btn-secondary">Save Expression</button>
              <button className="btn-secondary">Share with AI Coach</button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <span className="text-lg mr-2">💡</span>
            Expression Tips
          </h4>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• Use colors that feel right to you - there are no wrong choices</p>
            <p>• Draw abstract shapes, patterns, or realistic images - whatever feels natural</p>
            <p>• Select multiple emojis if you're feeling complex emotions</p>
            <p>• Your expression is unique and valid, regardless of artistic skill</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoodleMoodInput;
