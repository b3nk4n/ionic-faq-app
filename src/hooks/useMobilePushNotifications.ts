import { useEffect, useState } from "react";

import { PushNotificationSchema, PushNotifications, Token, ActionPerformed } from "@capacitor/push-notifications";
import { Toast } from "@capacitor/toast";
import { Capacitor } from "@capacitor/core";

export interface MobileNotification {
  id: string;
  title: string;
  body: string;
  type: "foreground" | "action";
}

const emptyNotifications: MobileNotification[] = [];

/**
 * Hook for push notifications on mobile Android / iOS platforms.
 *
 * For futher setup instructions, such as google-services.json or android/build.gradle for Android,
 * or generating a Push Certificate for iOS, check out the following post:
 * https://enappd.com/blog/firebase-push-notification-in-ionic-react-capacitor/111/
 *
 * @return {MobileNotification[]} The received mobile notifications of the current session.
 */
export const useMobilePushNotifications = () => {
  const [notifications, setNotifications] = useState<MobileNotification[]>(emptyNotifications);

  if (!Capacitor.isPluginAvailable("PushNotifications")) {
    return {
      notifications: emptyNotifications,
    };
  }


  const register = () => {
    console.log("Registering push notifications...");

    PushNotifications.register();

    PushNotifications.addListener("registration",
        async (token: Token) => {
          await Toast.show({
            text: "Push notification registration succeeded.",
          });
          console.log({ token });
        }
    );

    PushNotifications.addListener("registrationError",
        (error: any) => {
          console.error({ error });
        }
    );

    PushNotifications.addListener("pushNotificationReceived",
        (notification: PushNotificationSchema) => {
          console.log({ foregroundNotification: notification });
          setNotifications((notifications) => [
            ...notifications,
            {
              id: notification.id,
              title: notification.title,
              body: notification.body,
              type: "foreground",
            } as MobileNotification,
          ]);
        }
    );

    PushNotifications.addListener("pushNotificationActionPerformed",
        (notification: ActionPerformed) => {
          console.log({ tappedActionNotification: notification });
          setNotifications((notifications) => [
            ...notifications,
            {
              id: notification.notification.data.id,
              title: notification.notification.data.title,
              body: notification.notification.data.body,
              type: "action" } as MobileNotification,
          ]);
        }
    );
  };

  useEffect(() => {
    PushNotifications.checkPermissions().then((res) => {
      if (res.receive !== "granted") {
        PushNotifications.requestPermissions().then(async (res) => {
          if (res.receive === "denied") {
            await Toast.show({
              text: "Push Notification permission denied.",
            });
          } else {
            await Toast.show({
              text: "Push Notification permission granted.",
            });

            register();
          }
        });
      } else {
        register();
      }
    });
  }, []);

  return {
    notifications,
  };
};
