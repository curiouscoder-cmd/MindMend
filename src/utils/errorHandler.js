// Comprehensive Error Handling Utility for MindMend AI

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason, {
        type: 'promise_rejection',
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error, {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      });
    });
  }

  logError(title, error, context = {}) {
    const errorEntry = {
      id: Date.now(),
      title,
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.unshift(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${title}]`, error, context);
    }

    // Send to analytics service if available
    this.sendToAnalytics(errorEntry);
  }

  sendToAnalytics(errorEntry) {
    // Only send critical errors to avoid spam
    if (this.isCriticalError(errorEntry)) {
      try {
        // Send to your analytics service
        fetch('/.netlify/functions/error-logging', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorEntry)
        }).catch(() => {
          // Silently fail if analytics is unavailable
        });
      } catch (e) {
        // Prevent error handling from causing more errors
      }
    }
  }

  isCriticalError(errorEntry) {
    const criticalPatterns = [
      /network error/i,
      /failed to fetch/i,
      /api.*error/i,
      /authentication/i,
      /authorization/i,
      /payment/i,
      /crisis/i
    ];

    return criticalPatterns.some(pattern => 
      pattern.test(errorEntry.message) || 
      pattern.test(errorEntry.title)
    );
  }

  // Specific error handlers for different scenarios
  handleAPIError(error, endpoint, requestData = null) {
    const context = {
      type: 'api_error',
      endpoint,
      requestData: requestData ? JSON.stringify(requestData) : null,
      status: error.status || 'unknown',
      statusText: error.statusText || 'unknown'
    };

    this.logError('API Error', error, context);

    // Return user-friendly error message
    return this.getUserFriendlyMessage(error, 'api');
  }

  handleVoiceError(error, operation) {
    const context = {
      type: 'voice_error',
      operation,
      permissions: this.checkPermissions()
    };

    this.logError('Voice Error', error, context);
    return this.getUserFriendlyMessage(error, 'voice');
  }

  handleAIError(error, feature) {
    const context = {
      type: 'ai_error',
      feature,
      isOnline: navigator.onLine
    };

    this.logError('AI Error', error, context);
    return this.getUserFriendlyMessage(error, 'ai');
  }

  handleStorageError(error, operation, data = null) {
    const context = {
      type: 'storage_error',
      operation,
      storageAvailable: this.checkStorageAvailability(),
      dataSize: data ? JSON.stringify(data).length : 0
    };

    this.logError('Storage Error', error, context);
    return this.getUserFriendlyMessage(error, 'storage');
  }

  checkPermissions() {
    return {
      microphone: navigator.permissions ? 
        navigator.permissions.query({name: 'microphone'}).then(p => p.state) : 
        'unknown',
      camera: navigator.permissions ? 
        navigator.permissions.query({name: 'camera'}).then(p => p.state) : 
        'unknown'
    };
  }

  checkStorageAvailability() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return { localStorage: true, sessionStorage: true };
    } catch (e) {
      return { localStorage: false, sessionStorage: false };
    }
  }

  getUserFriendlyMessage(error, category) {
    const messages = {
      api: {
        network: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
        timeout: "The request is taking longer than expected. Please try again in a moment.",
        server: "Our servers are experiencing issues. Please try again later.",
        auth: "There was an authentication issue. Please refresh the page and try again.",
        default: "Something went wrong with our service. Please try again."
      },
      voice: {
        permission: "We need microphone permission to use voice features. Please allow access and try again.",
        notSupported: "Voice features are not supported in your browser. Please try using a different browser.",
        network: "Voice processing requires an internet connection. Please check your connection and try again.",
        default: "There was an issue with the voice feature. Please try again."
      },
      ai: {
        network: "AI features require an internet connection. Please check your connection and try again.",
        quota: "We've reached our AI processing limit. Please try again in a few minutes.",
        server: "Our AI service is temporarily unavailable. Please try again later.",
        default: "There was an issue with AI processing. Please try again."
      },
      storage: {
        quota: "Your device is running low on storage space. Please free up some space and try again.",
        permission: "We couldn't save your data. Please check your browser settings and try again.",
        default: "There was an issue saving your data. Please try again."
      }
    };

    const categoryMessages = messages[category] || messages.api;
    const errorMessage = error?.message?.toLowerCase() || '';

    // Match specific error patterns
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return categoryMessages.network || categoryMessages.default;
    }
    if (errorMessage.includes('timeout')) {
      return categoryMessages.timeout || categoryMessages.default;
    }
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
      return categoryMessages.permission || categoryMessages.default;
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return categoryMessages.quota || categoryMessages.default;
    }
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return categoryMessages.auth || categoryMessages.default;
    }

    return categoryMessages.default;
  }

  // Recovery suggestions
  getRecoverySuggestions(error, category) {
    const suggestions = {
      api: [
        "Check your internet connection",
        "Refresh the page and try again",
        "Try again in a few minutes",
        "Contact support if the issue persists"
      ],
      voice: [
        "Allow microphone permissions in your browser",
        "Check if your microphone is working",
        "Try using a different browser",
        "Ensure you have a stable internet connection"
      ],
      ai: [
        "Check your internet connection",
        "Try again in a few minutes",
        "Use offline features while we resolve the issue",
        "Contact support if the issue continues"
      ],
      storage: [
        "Free up storage space on your device",
        "Clear your browser cache",
        "Try using a different browser",
        "Check your browser's storage settings"
      ]
    };

    return suggestions[category] || suggestions.api;
  }

  // Get error statistics for debugging
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byCategory: {},
      recent: this.errorLog.slice(0, 10),
      critical: this.errorLog.filter(e => this.isCriticalError(e)).length
    };

    this.errorLog.forEach(error => {
      const type = error.context?.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      const category = type.split('_')[0];
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }

  // Clear error log
  clearErrors() {
    this.errorLog = [];
  }

  // Export errors for debugging
  exportErrors() {
    return {
      errors: this.errorLog,
      stats: this.getErrorStats(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Convenience functions for different error types
export const handleAPIError = (error, endpoint, requestData) => {
  console.error(`API Error at ${endpoint}:`, error);
  return "We're having trouble connecting to our servers. Please try again.";
};

export const handleVoiceError = (error, operation) => {
  console.error(`Voice Error in ${operation}:`, error);
  return "There was an issue with the voice feature. Please try again.";
};

export const handleAIError = (error, feature) => {
  console.error(`AI Error in ${feature}:`, error);
  return "There was an issue with AI processing. Please try again.";
};

export const handleStorageError = (error, operation, data) => {
  console.error(`Storage Error in ${operation}:`, error);
  return "There was an issue saving your data. Please try again.";
};

export const logError = (title, error, context) => {
  console.error(`${title}:`, error, context);
};

export const getErrorStats = () => ({ total: 0, byType: {}, recent: [] });

export const clearErrors = () => console.log('Errors cleared');

export const exportErrors = () => ({ errors: [], timestamp: new Date().toISOString() });

export default errorHandler;
