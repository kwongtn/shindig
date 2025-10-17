import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'
  ? {
      // Use fake config for development with emulators
      apiKey: 'fake-api-key-for-development',
      authDomain: 'localhost',
      projectId: 'fake-project-id',
      storageBucket: 'fake-storage-bucket',
      messagingSenderId: 'fake-sender-id',
      appId: 'fake-app-id',
    }
  : {
      // Production config - using environment variables
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

// Initialize Firebase - avoid initializing multiple times
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth and connect to emulator in development
export const auth = getAuth(app);
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  // Connect to Firebase Auth emulator when running in development
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}