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
    const init = async () => {
      const success = await registerServiceWorker();
      if (success) {
        requestMessagingToken(async (token) => {
          setToken(token);
          if (token) {
            const result = await subscribeToNewEntries(token);
            console.log("Subscribed to new entries", result);
          }
        });

        onMessage(messaging, async (payload) => {
          console.log("Message received in foreground. ", payload);
          await Toast.show({
            text: payload.notification?.title + " " + payload.notification?.body,
          });
        });
      }
    };

    init();
  }, []);

  return {
    token,
    deleteMessagingToken,
    manuallyRequestNotificationPermissions: async () => {
      await requestNotificationPermission(setToken);
    },
  } as WebPushNotificationsResult;
};

const registerServiceWorker = async (): Promise<boolean> => {
  if ("serviceWorker" in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js`;

    try {
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log("Registration successful, scope is:", registration);
      return true;
    } catch (error) {
      console.log("Service worker registration failed, error:", error);
    }
  }
  return false;
};
const requestMessagingToken = (onToken: (token: string) => void): void => {
  // internally ask for notification permissions and get a token if allowed and not blocked
  getToken(messaging, {
    vapidKey: process.env.REACT_APP_FIREBASE_CLOUD_MSG_VAPID_KEY,
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

    requestMessagingToken(onToken);
  } else {
    console.log("Unable to get permission to notify.");
  }
};
