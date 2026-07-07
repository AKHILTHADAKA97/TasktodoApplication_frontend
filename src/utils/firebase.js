import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';

let auth = null;
let provider = null;
let isFirebaseConfigured = false;
let isInitialized = false;

const initFirebase = async () => {
  if (isInitialized) return;

  try {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await axios.get(`${baseURL}/auth/firebase-config`);
    const config = response.data?.config;

    if (config && config.apiKey && config.authDomain && config.projectId) {
      const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
      isFirebaseConfigured = true;
      console.log("Firebase initialized dynamically on client.");
    }
  } catch (error) {
    console.error("Failed to fetch Firebase config or initialize:", error);
  } finally {
    isInitialized = true;
  }
};

export const signInWithGoogle = async () => {
  await initFirebase();

  if (isFirebaseConfigured) {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      return {
        token,
        user: result.user
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  } else {
    // Graceful developer prompt bypass for local testing
    console.log("Firebase credentials not configured on backend. Running sandbox simulation.");
    const email = window.prompt("Simulated Google Auth (Developer Sandbox):\nEnter email address:", "googleuser@example.com");
    if (!email) {
      throw new Error("Mock Google login cancelled.");
    }
    
    const mockToken = `mock_google_token_${email}`;
    return {
      token: mockToken,
      user: {
        email,
        displayName: email.split('@')[0].toUpperCase(),
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        uid: `mock_uid_${email.split('@')[0]}`
      }
    };
  }
};

export { auth, isFirebaseConfigured };
