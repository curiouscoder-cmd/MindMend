/**
 * Streaming Translation Demo Component
 * 
 * Demonstrates the hybrid Gemma + Gemini streaming translation system
 * with real-time progress indicators and performance metrics
 */

import React, { useState, useRef } from 'react';
import { streamTranslation, getTranslationMetrics, getSupportedLanguages } from '../services/streamingTranslationService.js';

const StreamingTranslationDemo = () => {
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState([]);
  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  const progressRef = useRef(null);
  const supportedLanguages = getSupportedLanguages();

  const handleStreamTranslation = async () => {
    if (!inputText.trim()) return;
    
    setIsStreaming(true);
    setStreamingProgress([]);
    setResult(null);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      const onProgress = (progressData) => {
        const timestamp = Date.now() - startTime;
        setStreamingProgress(prev => [...prev, { ...progressData, timestamp }]);
        
        // Auto-scroll to bottom
        if (progressRef.current) {
          progressRef.current.scrollTop = progressRef.current.scrollHeight;
        }
      };
      
      const translationResult = await streamTranslation(inputText, targetLanguage, onProgress);
      setResult(translationResult);
      
      // Get updated metrics
      const currentMetrics = await getTranslationMetrics();
      setMetrics(currentMetrics);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  };

  const getProgressIcon = (stage) => {
    switch (stage) {
      case 'detecting_language': return '🔍';
      case 'language_detected': return '✅';
      case 'translating': return '🌐';
      case 'translation_chunk': return '📝';
      case 'completed': return '🎉';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getProgressColor = (stage) => {
    switch (stage) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'language_detected': return 'text-blue-600';
      case 'translation_chunk': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 Hybrid Streaming Translation Demo
        </h2>
        <p className="text-gray-600">
          Real-time translation using Gemma 3 + Gemini 2.5 Live API with streaming
        </p>
      </div>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text in any supported language..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isStreaming}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isStreaming}
          >
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code})
              </option>
            ))}
          </select>
          
          <button
            onClick={handleStreamTranslation}
            disabled={isStreaming || !inputText.trim()}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Streaming...
              </span>
            ) : (
              '🌊 Start Streaming Translation'
            )}
          </button>
        </div>
      </div>

      {/* Streaming Progress */}
      {streamingProgress.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📊 Streaming Progress
          </h3>
          <div 
            ref={progressRef}
            className="bg-gray-50 border rounded-md p-4 h-48 overflow-y-auto space-y-2"
          >
            {streamingProgress.map((progress, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-lg">{getProgressIcon(progress.stage)}</span>
                <div className="flex-1">
                  <span className={`font-medium ${getProgressColor(progress.stage)}`}>
                    {progress.stage.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-500 ml-2">
                    +{progress.timestamp}ms
                  </span>
                  {progress.language && (
                    <span className="text-blue-600 ml-2">
                      ({progress.language})
                    </span>
                  )}
                  {progress.confidence && (
                    <span className="text-green-600 ml-2">
                      {(progress.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  {progress.chunk && (
                    <div className="mt-1 p-2 bg-white rounded border text-gray-700">
                      {progress.chunk}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ✨ Translation Result
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Original Text</h4>
                <p className="text-gray-800 bg-white p-3 rounded border">
                  {result.originalText}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Translated Text</h4>
                <p className="text-gray-800 bg-white p-3 rounded border">
                  {result.translatedText}
                </p>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {result.latency || 0}ms
                </div>
                <div className="text-gray-600">Total Latency</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {result.detectedLanguage || 'auto'}
                </div>
                <div className="text-gray-600">Detected Lang</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">
                  {result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}
                </div>
                <div className="text-gray-600">Confidence</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">
                  {result.fromCache ? '✅' : '❌'}
                </div>
                <div className="text-gray-600">Cache Hit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* System Metrics */}
      {metrics && (
        <div className="bg-gray-50 border rounded-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📈 System Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {metrics.requests || 0}
              </div>
              <div className="text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {metrics.gemmaSuccessRate || '0%'}
              </div>
              <div className="text-gray-600">Gemma Success</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">
                {metrics.fallbackRate || '0%'}
              </div>
              <div className="text-gray-600">Fallback Rate</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">
                {metrics.cacheSize || 0}
              </div>
              <div className="text-gray-600">Cache Entries</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingTranslationDemo;
