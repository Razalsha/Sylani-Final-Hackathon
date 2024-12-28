// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArpX7PDrWBgxhhG4w2VUW1GhDMtRMK_90",
  authDomain: "final-test-194fa.firebaseapp.com",
  projectId: "final-test-194fa",
  storageBucket: "final-test-194fa.firebasestorage.app",
  messagingSenderId: "679589531693",
  appId: "1:679589531693:web:72d30c52557bbe035028a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
