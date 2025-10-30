import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as elevenLabsService from '../services/elevenLabsService';
import * as ttsService from '../services/ttsService';

const VoiceEnabledMessage = ({ 
  message, 
  persona = 'mira', 
  emotion = 'supportive',
  autoPlay = false,
  showControls = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (autoPlay && message.content) {
      // Add a small delay to prevent immediate auto-play on page load
      const timer = setTimeout(() => {
        handlePlayMessage();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [message.content, autoPlay]);

  // Listen for speech synthesis end
  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsPlaying(false);
    };

    return () => {
      // Cleanup if component unmounts while speaking
      ttsService.stopSpeech();
    };
  }, []);

  const handlePlayMessage = async () => {
    if (isPlaying) {
      handleStopMessage();
      return;
    }

    console.log('🔊 VoiceEnabledMessage: Starting playback');
    console.log('📝 Message:', message.content.substring(0, 50) + '...');
    console.log('🎭 Emotion:', emotion);

    setIsLoading(true);
    setError(null);

    try {
      let url = audioUrl;
      
      if (!url) {
        console.log('🎙️ Generating new audio with ElevenLabs...');
        // Generate speech with ElevenLabs (auto-fallback to Web Speech)
        url = await elevenLabsService.generateSpeech(
          message.content, 
          { 
            emotion,
            voice: 'rachel', // Best female voice for India
            language: 'en',
            useCache: true,
            onEnd: () => {
              console.log('🎵 Speech ended, updating UI');
              setIsPlaying(false);
            },
            onStart: () => {
              console.log('🎵 Speech started');
              setIsLoading(false);
            }
          }
        );
        console.log('✅ Audio generated:', url ? 'Success' : 'Failed');
        setAudioUrl(url);
      } else {
        console.log('💾 Using cached audio');
        // For cached audio, play it
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.onplay = () => setIsLoading(false);
        await audio.play();
      }

      if (url && (url.startsWith('blob:') || url === 'browser_tts')) {
        setIsPlaying(true);
      } else if (!url) {
        setError('Failed to generate audio');
      }
    } catch (err) {
      console.error('Error playing message:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMessage = () => {
    // Stop Web Speech API or audio element
    ttsService.stopSpeech();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const getPersonaIcon = (persona) => {
    const icons = {
      mira: '🤖',
      dr_maya: '👩‍⚕️',
      arjun: '👨‍🎓',
      priya: '👩‍💼',
      rohit: '👨‍💻',
      meditation: '🧘‍♀️'
    };
    return icons[persona] || '🤖';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      supportive: 'text-blue-600',
      encouraging: 'text-green-600',
      calming: 'text-purple-600',
      energetic: 'text-orange-600'
    };
    return colors[emotion] || 'text-blue-600';
  };

  return (
    <div className="voice-enabled-message">
      {/* Message Content */}
      <div className="flex items-start space-x-3 mb-2">
        <div className="flex-shrink-0 text-2xl">
          {getPersonaIcon(persona)}
        </div>
        <div className="flex-1">
          <div className="text-calm-700 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-calm-800" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="ml-2" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-calm-900" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-calm-900" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 text-calm-800" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className="bg-calm-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                    : <code className="block bg-calm-100 p-2 rounded text-sm font-mono overflow-x-auto" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-calm-300 pl-4 italic my-3" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Voice Controls */}
          {showControls && (
            <div className="flex items-center space-x-3 mt-3">
              {/* Play/Stop Button */}
              <button
                onClick={handlePlayMessage}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
                  isPlaying 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <span>⏹️</span>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <span>🔊</span>
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Speed Control */}
              {!isLoading && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-calm-500">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        playbackSpeed === speed
                          ? 'bg-primary-500 text-white'
                          : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Status */}
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-calm-500">
                  ElevenLabs Rachel • Premium Voice
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Emotion Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-calm-500">Tone:</span>
            <span className={`text-xs font-medium ${getEmotionColor(emotion)}`}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceEnabledMessage;
