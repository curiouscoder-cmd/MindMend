import React, { useState, useRef, useEffect } from 'react';
import elevenLabsService from '../services/elevenLabsService';

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

  const handlePlayMessage = async () => {
    if (isPlaying) {
      handleStopMessage();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let url = audioUrl;
      
      if (!url) {
        // Generate speech if not cached
        url = await elevenLabsService.generateSpeech(
          message.content, 
          persona,
          { emotion }
        );
        setAudioUrl(url);
      }

      if (url && url !== 'browser_tts') {
        // Play ElevenLabs generated audio
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.playbackRate = playbackSpeed;
        audio.volume = 0.8;
        
        audio.addEventListener('loadstart', () => setIsLoading(true));
        audio.addEventListener('canplay', () => setIsLoading(false));
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          audioRef.current = null;
        });
        audio.addEventListener('error', (e) => {
          setError('Audio playback failed');
          setIsPlaying(false);
          setIsLoading(false);
        });

        await audio.play();
      } else if (url === 'browser_tts') {
        // Browser TTS is already playing
        setIsPlaying(true);
        setIsLoading(false);
        
        // Simulate end event for browser TTS
        setTimeout(() => {
          setIsPlaying(false);
        }, message.content.length * 50); // Rough estimate
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser TTS if active
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
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
          <p className="text-calm-700 leading-relaxed">{message.content}</p>
          
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
                <div className={`w-2 h-2 rounded-full ${
                  elevenLabsService.isAvailable() ? 'bg-green-400' : 'bg-orange-400'
                }`}></div>
                <span className="text-xs text-calm-500">
                  {elevenLabsService.isAvailable() ? 'AI Voice' : 'Browser TTS'}
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
