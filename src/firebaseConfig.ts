import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { deleteToken, getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { Toast } from "@capacitor/toast";
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
onMessage(messaging, async (payload) => {
  console.log("Message received. ", payload);
  await Toast.show({
    text: payload.notification?.title + " " + payload.notification?.body,
  });
});

export const requestNotificationPermission = async () => {
  console.log("Requesting permission...");

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");

    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_CLOUD_MSG_VAPID_KEY,
      });
      if (currentToken) {
        // Send the token to your server and update the UI if necessary
        // ...
        console.log({ currentToken });
      } else {
        // Show permission request UI
        console.log("No registration token available. Request permission to generate one.");
        // ...
      }
    } catch (error) {
      console.log("An error occurred while retrieving token. ", error);
    }
  } else {
    console.log("Unable to get permission to notify.");
  }
};
// requestNotificationPermission();

export const deleteMessagingToken = async () => {
  try {
    await deleteToken(messaging);
    console.log("Token deleted.");
  } catch (error) {
    console.log("Unable to delete token. ", error);
  }
};

if ("serviceWorker" in navigator) { // TODO add permission check as above, and move to a hook?
  const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;
  console.log("Navigator is service worker");
  navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log("Registration successful, scope is:", registration);

        getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_CLOUD_MSG_VAPID_KEY,
        })
            .then((currentToken) => {
              if (currentToken) {
                console.log("current token for client: ", currentToken);
              } else {
                console.log("No registration token available. Request permission to generate one.");
              }
            }).catch((err) => {
              console.log("An error occurred while retrieving token. ", err);
            });
      })
      .catch((err) => {
        console.log("Service worker registration failed, error:", err);
      });
}

