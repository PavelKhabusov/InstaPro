import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, OAuthProvider } from "firebase/auth"; // Importing auth methods
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get services
const db = getFirestore();
const storage = getStorage();
const auth = getAuth(); // Initialize Firebase Authentication

// Listen to authentication state changes
const onUserAuthStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback); // This listens for any auth state changes (sign-in/sign-out)
};

// Google Sign-In
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider); // Trigger Google sign-in popup
};

// Apple Sign-In (OAuth)
const signInWithApple = () => {
  const provider = new OAuthProvider("apple.com");
  return signInWithPopup(auth, provider); // Trigger Apple sign-in popup
};

// Sign-out user
const signOutUser = () => {
  return signOut(auth); // Sign the user out
};
const useAuthSession = () => {
  const [session, setSession] = useState(null); // State to hold the user session

  // Track the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession(user); // Set session if user is authenticated
      } else {
        setSession(null); // Set session to null if no user is signed in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []); // Empty dependency array to run once on mount

  return session; // Return the session state
};

export { app, db, storage, auth, useAuthSession, onUserAuthStateChanged, signInWithGoogle, signInWithApple, signOutUser };
