import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
          
          {/* Spinning ring */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full animate-ping"></div>
        </div>
        
        <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">
          {message}
        </p>
        
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
