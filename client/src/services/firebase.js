// Import Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5vBfFfHo_G3OL6rLx771-psr2GUfqbPk",
  authDomain: "lostandfoundapp-10853.firebaseapp.com",
  projectId: "lostandfoundapp-10853",
  storageBucket: "lostandfoundapp-10853.appspot.com",
  messagingSenderId: "249024642695",
  appId: "1:249024642695:web:ee5977224bd6c71c60c222"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
