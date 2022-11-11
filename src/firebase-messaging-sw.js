/**
 * Read for further deatils:
 * - https://github.com/firebase/firebase-js-sdk/issues/5732
 */
importScripts("https://www.gstatic.com/firebasejs/9.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.12.0/firebase-messaging-compat.js");

self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked ", event);

  event.notification.close();

  if (event.action === "new") {
    clients.openWindow("/entry/new");
    return;
  }

  // user clicks main body of the notification
  const clickAction = event.notification.data["FCM_MSG"].notification["click_action"];
  if (clickAction) {
    // somehow it seems we need to handle this manually here, when such a click action is set in the notification
    clients.openWindow(clickAction);
  }

  // open the home page by default
  clients.openWindow("/");
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
  
  if (payload.notification) {
    // If the notification fields are set, then the browswer is already handling the notification
    return;
  }

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "/assets/icon/icon-144.png",
    vibrate: [100, 100, 200, 100, 300, 100, 400],
    tag: "background-notification",
    actions: [
      {
        action: 'new',
        title: 'New Entry'
      }
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
