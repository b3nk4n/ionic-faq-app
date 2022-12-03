import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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

if (process.env.REACT_APP_FIREBASE_OFFLINE_MODE === "true") {
  enableIndexedDbPersistence(db)
      .then(() => console.log("Enabled offline persistence"))
      .catch((error) => {
        console.warn("Enabling offline persistence failed.", error);
        if (error.code == "failed-precondition") {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (error.code == "unimplemented") {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      });
}

export const analytics = getAnalytics(app);

const functions = getFunctions();
export const resetAllPublicUpvotes = httpsCallable(functions, "resetAllPublicUpvotes");
export const upvoteEntry = httpsCallable(functions, "upvoteEntry");

interface TokenRequest {
  token: string;
}

export const subscribeToNotifications = httpsCallable<TokenRequest, boolean>(functions, "subscribeToNotifications");
export const unsubscribeFromNotifications = httpsCallable<TokenRequest, boolean>(
    functions, "unsubscribeFromNotifications");

export const messaging = getMessaging(app);
