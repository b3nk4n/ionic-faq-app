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

const app = firebase.initializeApp({
  apiKey: "<key>",
  authDomain: "ionic-faq-app.firebaseapp.com",
  projectId: "ionic-faq-app",
  storageBucket: "ionic-faq-app.appspot.com",
  messagingSenderId: "697272837831",
  appId: "1:697272837831:web:2e8c86bb2c585d4cd840e2",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  // Customize notification here, which is then however redundant
  // with the notification automatically displayed by Chrome that does not repsect the icon.
  /*const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/assets/icon/icon-144.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);*/
});
