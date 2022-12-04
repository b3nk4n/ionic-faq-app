import { useEffect, useState } from "react";

import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { isPlatform } from "@ionic/react";
import { Toast } from "@capacitor/toast";

import { messaging } from "../firebaseConfig";
import { subscribeToNewEntries } from "../utils/firebaseUtils";

interface WebPushNotificationsResult {
  token: string | null;
  deleteMessagingToken: () => Promise<void>;
  manuallyRequestNotificationPermissions: () => Promise<void>;
}

const emptyResult: WebPushNotificationsResult = {
  token: null,
  deleteMessagingToken: async () => Promise.resolve(),
  manuallyRequestNotificationPermissions: async () => Promise.resolve(),
};

/**
 * Hook for Web push notifications.
 *
 * Please note that in the current version, there is a 404 error happening with getToken
 * when the permissions are reset manually in the browser. This seems to be a know Firebase
 * bug, as described in https://github.com/firebase/firebase-js-sdk/issues/2364.
 *
 * @return {WebPushNotificationsResult} Web notifications result.
 */
export const useWebPushNotifications = (): WebPushNotificationsResult => {
  if (!isPlatform("pwa") && !isPlatform("desktop") && !isPlatform("mobileweb")) {
    return emptyResult;
  }

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Init push notifications service worker and handlers.
     * @param {boolean} useCustomServiceWorkerRegistration Whether to use a custom service worker registration,
     *                                                     or the default created by Firebase out of the box.
     */
    const init = async (useCustomServiceWorkerRegistration: boolean) => {
      const registration = undefined;
      if (useCustomServiceWorkerRegistration) {
        const registration = await registerServiceWorker();
        if (registration == null) {
          console.warn("Custom service worker registration failed.");
          return;
        }
      }

      requestMessagingToken(async (token) => {
        setToken(token);
        if (token) {
          const result = await subscribeToNewEntries(token);
          console.log("Subscribed to new entries", result);
        }
      }, registration);

      onMessage(messaging, async (payload) => {
        console.log("Message received in foreground. ", payload);

        const title = payload.notification?.title ?? payload.data?.title;
        const body = payload.notification?.body ?? payload.data?.body;

        await Toast.show({
          text: title + " " + body,
        });
      });
    };

    init(false);
  }, []);

  return {
    token,
    deleteMessagingToken,
    manuallyRequestNotificationPermissions: async () => {
      await requestNotificationPermission(setToken);
    },
  } as WebPushNotificationsResult;
};

const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ("serviceWorker" in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;

    try {
      // give the service worker a pseudo scope, to not clash or replace our service-worker.js
      // that is running in root ("/") scope
      const registration = await navigator.serviceWorker.register(swUrl, { scope: "/firebase/" });
      console.log("Web push service worker registration successful, scope is:", registration);
      return registration;
    } catch (error) {
      console.log("Web push service worker registration failed, error:", error);
    }
  }
  return null;
};
const requestMessagingToken = (onToken: (token: string) => void, registration?: ServiceWorkerRegistration): void => {
  // internally ask for notification permissions and get a token if allowed and not blocked
  getToken(messaging, {
    vapidKey: process.env.REACT_APP_FIREBASE_CLOUD_MSG_VAPID_KEY,
    // if not defined, a registration with scope named "/firebase-cloud-messaging-push-scope" is automatically created
    serviceWorkerRegistration: registration,
  })
      .then((currentToken) => {
        if (currentToken) {
          console.log("current token for client: ", currentToken);
          onToken(currentToken);
        } else {
          console.log("No registration token available. Request permission to generate one.");
        }
      }).catch((err) => {
        if (err.code === "messaging/permission-blocked") {
          console.log("Notification permissions are blocked for this app.");
          return;
        }
        console.error("An unknown error occurred while retrieving token. ", err);
      });
};

const deleteMessagingToken = async () => {
  try {
    await deleteToken(messaging);
    console.log("Token deleted.");
  } catch (error) {
    console.log("Unable to delete token. ", error);
  }
};

export const hasNotificationPermission = () => {
  return Notification.permission === "granted";
};

export const hasDeniedNotificationPermission = () => {
  return Notification.permission === "denied";
};

const requestNotificationPermission = async (onToken: (token: string) => void) => {
  if (hasNotificationPermission()) {
    // Do not ask again
    return;
  }

  if (hasDeniedNotificationPermission()) {
    // Once the user has explicitl denied the permissions, asking again will not work anymore.
    // The user has to manually reset / allow this notifications via the browser settings.
    return;
  }

  console.log("Requesting permission...");

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");

    // Note that this assumes that we use the default SW registration by Firebase
    requestMessagingToken(onToken, undefined);
  } else {
    console.log("Unable to get permission to notify.");
  }
};
