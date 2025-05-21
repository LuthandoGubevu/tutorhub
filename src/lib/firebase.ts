
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2k4-_YjfeIfrI58b-tezV8r9m7WkPU_Q",
  authDomain: "ikasi-tutoring.firebaseapp.com",
  projectId: "ikasi-tutoring",
  storageBucket: "ikasi-tutoring.firebasestorage.app",
  messagingSenderId: "880682416579",
  appId: "1:880682416579:web:e602d67c1e8cd2b07ca576",
  measurementId: "G-XLDCKCT1J8"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };

