import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "ionic-faq-app.firebaseapp.com",
  projectId: "ionic-faq-app",
  storageBucket: "ionic-faq-app.appspot.com",
  messagingSenderId: "697272837831",
  appId: "1:697272837831:web:2e8c86bb2c585d4cd840e2",
  measurementId: "G-SP4T8SSYS9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

const functions = getFunctions();
export const resetAllPublicUpvotes = httpsCallable(functions, "resetAllPublicUpvotes");
export const upvoteEntry = httpsCallable(functions, "upvoteEntry");

export const messaging = getMessaging(app);
