// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <-- Add this


// Replace with your web app's Firebase configuration from Project Settings in Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBTtzsEnz7Vek9q4bbEeCrqe4mWDTf9Z0M",
  authDomain: "boostraagency.firebaseapp.com",
  projectId: "boostraagency",
  storageBucket: "boostraagency.firebasestorage.app",
  messagingSenderId: "73849289556",
  appId: "1:73849289556:web:9855604dc598bd7010e6c1",
  measurementId: "G-YT4R6NBLK6"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // <-- Add this


export { db, auth, app };
