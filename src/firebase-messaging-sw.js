/**
 * Read for further deatils:
 * - https://github.com/firebase/firebase-js-sdk/issues/5732
 */
importScripts("https://www.gstatic.com/firebasejs/9.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.11.0/firebase-messaging-compat.js");

self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked ", event);
});

self.addEventListener("notificationclose", (event) => {
  console.log("[firebase-messaging-sw.js] Notification closed ", event);
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "ionic-faq-app.firebaseapp.com",
  projectId: "ionic-faq-app",
  storageBucket: "ionic-faq-app.appspot.com",
  messagingSenderId: "697272837831",
  appId: "1:697272837831:web:2e8c86bb2c585d4cd840e2",
  measurementId: "G-SP4T8SSYS9",
};

const app = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  // Customize notification here, which is redundant when sent with notification fields,
  // but not when data fields are used instead.
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/assets/icon/icon-144.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
