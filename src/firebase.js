// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyBo2D9vhncvurJzF2mbn_F9SuSrgZk1fxc",
  authDomain: "workshop-tk-aces-xvi.firebaseapp.com",
  projectId: "workshop-tk-aces-xvi",
  storageBucket: "workshop-tk-aces-xvi.firebasestorage.app",
  messagingSenderId: "892826876631",
  appId: "1:892826876631:web:15813b49540860c4040e92",
  measurementId: "G-H2MP9MEXQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const _analytics = getAnalytics(app);
//Recaptcha
if (typeof window !== "undefined") {
  const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  if (isDevelopment) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: isDevelopment
      ? new CustomProvider({
          getToken: () => new Promise((resolve) => resolve({ token: 'debug' }))
        })
      : new ReCaptchaV3Provider("6LdQHFctAAAAAJcQztxmwTgSxZ9q4Uh7oWctE4W-"),
    isTokenAutoRefreshEnabled: true
  });
}
// Inisialisasi Firestore Database
export const db = getFirestore(app);
