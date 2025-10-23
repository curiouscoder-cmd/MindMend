// Firebase Functions Entry Point
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Import function modules
import { chat } from './chat.js';
import { chatMultilingual } from './chatMultilingual.js';
import { analyzeMood } from './analyzeMood.js';
import { analyzeDoodle } from './analyzeDoodle.js';

// Export functions
export { 
  chat,
  chatMultilingual,
  analyzeMood, 
  analyzeDoodle 
};
