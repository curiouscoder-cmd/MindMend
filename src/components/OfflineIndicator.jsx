import React, { useState, useEffect } from 'react';
import offlineService from '../services/offlineService';

const OfflineIndicator = () => {
  const [offlineStatus, setOfflineStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setOfflineStatus(offlineService.getOfflineStatus());
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!offlineStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all ${
          offlineStatus.isOnline
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-orange-100 text-orange-800 border border-orange-200'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            offlineStatus.isOnline ? 'bg-green-500' : 'bg-orange-500'
          } animate-pulse`}
        ></div>
        <span className="text-sm font-medium">
          {offlineStatus.isOnline ? 'Online' : 'Offline Mode'}
        </span>
        <span className="text-xs">
          {showDetails ? '▼' : '▶'}
        </span>
      </div>

      {showDetails && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-calm-200 p-4 z-50">
          <div className="mb-4">
            <h3 className="font-semibold text-calm-800 mb-2">
              {offlineStatus.isOnline ? '🌐 Online Mode' : '📱 Offline Mode'}
            </h3>
            <p className="text-sm text-calm-600">
              {offlineStatus.isOnline
                ? 'All features available with AI-powered insights'
                : 'Basic features available without internet connection'
              }
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-calm-700 text-sm">Available Features:</h4>
            
            {Object.entries(offlineStatus.features).map(([feature, available]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-calm-600 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${available ? 'text-green-600' : 'text-gray-400'}`}>
                    {available ? '✓' : '✗'}
                  </span>
                  <span className={`text-xs ${available ? 'text-green-600' : 'text-gray-400'}`}>
                    {available ? 'Available' : 'Requires Internet'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!offlineStatus.isOnline && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 text-sm mb-2">Offline Benefits:</h4>
              <div className="text-blue-700 text-xs space-y-1">
                <p>• Access to 6+ CBT exercises</p>
                <p>• Mood tracking and journaling</p>
                <p>• Progress tracking</p>
                <p>• Data syncs when back online</p>
                <p>• Privacy-first local storage</p>
              </div>
            </div>
          )}

          {offlineStatus.isOnline && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 text-sm mb-2">Online Features:</h4>
              <div className="text-green-700 text-xs space-y-1">
                <p>• AI-powered chat with Mira</p>
                <p>• Personalized insights</p>
                <p>• Emotional Twin analysis</p>
                <p>• Voice & emotion detection</p>
                <p>• Community support</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowDetails(false)}
            className="mt-4 w-full text-xs text-calm-500 hover:text-calm-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
