// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// Inisialisasi Firestore Database
export const db = getFirestore(app);