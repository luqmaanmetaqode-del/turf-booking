import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDGNxC2MRLRxCZeGEkiQrfMcI0vfPKm4qU",
  authDomain: "turfx-e954f.firebaseapp.com",
  projectId: "turfx-e954f",
  storageBucket: "turfx-e954f.firebasestorage.app",
  messagingSenderId: "803272949462",
  appId: "1:803272949462:web:051b97d38d74a54b5a5377",
  measurementId: "G-Y61Z0E13QK"
};

console.log("Firebase Initialized with Project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
