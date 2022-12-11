/**
 * Read for further deatils:
 * - https://github.com/firebase/firebase-js-sdk/issues/5732
 */
importScripts("https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.14.0/firebase-auth-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js");

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
  // The apiKey can be hidden in different ways, such as:
  // - Using cra-append-sw tool: https://dev.to/3dayweek/the-easiest-way-to-extend-create-react-app-service-worker-without-ejecting-bfg
  //   - This is however not recommended anymore, and was initially only needed when CRA (create react app)
  //     did not make it easy to modify the (internal) SW code. Since CRA 4, this is however simplified via the
  //     generated service-worker.ts file.
  // - There are workarounds to pass it via URL query parameter when registering the service worker
  // - The API key is not considered "private" in Firebase, but just to identify the backend. See for more details:
  //   https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
  // Consequently, we will simply not bother with "not exposing" the API key for this demo project.
  // However, you might receive an email about "Publicly accessible Google API key for Google Cloud Platform project <App Name> (id: <AppId>)",
  // if you don't restrict the API Key to a specific web/mobile application, or to only a subset of the APIs.
  // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  apiKey: "AIzaSyCB0jCnxXWK8N7uKIYVcKEBMKuKX3Kkxyc",
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

  // The userId is (not yet) attached, because this requires a workaround via the
  // payload or path. For now, we assume that such notifications don't need to be filtered
  // out manually, because a user that created an entry should anyways only get a foreground
  // notification. And this is fine for now in this demo application.
  // const auth = app.auth();
  // if (payload.data.userId === auth.currentUser.uid) {
  //   console.log("Suppressing own notification");
  //   return;
  // }

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
