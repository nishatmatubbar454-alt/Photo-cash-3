/**
 * Firebase Client Configuration & Helper
 * Supports environment variables or offline fallback mode
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'socialcash-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'socialcash-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'socialcash-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
};

export const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);
