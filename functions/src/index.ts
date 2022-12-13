import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const TOPIC = "new-entry-updates";

admin.initializeApp();

export const userCreated = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("User created", {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    phone: user.phoneNumber,
  });

  await admin.firestore().collection("users").doc(user.uid).set({
    created: Date.now(),
    upvotedOn: [],
  });
});

export const userDeleted = functions.auth.user().onDelete(async (user) => {
  functions.logger.info("User deleted", {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    phone: user.phoneNumber,
  });

  const doc = admin.firestore().collection("users").doc(user.uid);
  return await doc.delete();
});

export const resetAllPublicUpvotes = functions.https.onCall((_, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Resetting all upvotes requires authentication."
    );
  }

  const userId = context.auth.uid;

  functions.logger.info("Resetting all upvotes for user", {
    uid: userId,
  });

  admin.firestore().collection("users").doc(userId).update({
    upvotedOn: [],
  });
});

export const upvoteEntry = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Upvoting requires authentication."
    );
  }

  const userDocRef = admin.firestore().collection("users").doc(context.auth.uid);
  const entryDocRef = admin.firestore().collection("entries").doc(data.id);

  const userDoc = await userDocRef.get();
  const userData = userDoc.data();
  if (userData?.upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Upvoting for an entry is only allowed once."
    );
  }

  try {
    await userDocRef.update({
      upvotedOn: [...(userData?.upvotedOn ?? []), data.id],
    });
    await entryDocRef.update({
      upvotes: admin.firestore.FieldValue.increment(1),
    });
  } catch (error) {
    throw new functions.https.HttpsError(
        "internal",
        "Update failed internally."
    );
  }
});

export const publicEntryActivities = functions.firestore.document("/entries/{id}")
    .onCreate(async (snapshot, context) => {
      const { id } = context.params;

      // The auth is not set for such trigger, which is still an open FR:
      // https://github.com/firebase/firebase-functions/issues/300
      // As a workaround, the userId could be sent via the payload (or document path),
      // and checked via security rule to protect from abuse. See the following example:
      // https://stackoverflow.com/questions/47129512/firestore-cloud-functions-get-uid
      const userId = context.auth?.uid;

      await sendNewEntryNotification(snapshot);

      await admin.firestore()
          .collection("activities")
          .add({
            msg: `A new public entry was created with id ${id} by user ${userId}`,
            ts: Date.now(),
          });
    });

async function sendNewEntryNotification(doc: QueryDocumentSnapshot): Promise<string> {
  const entryTitle = doc.data().title;

  const payload = {
    topic: TOPIC,
    data: {
      title: "New question was asked!",
      body: `Title: ${entryTitle}`,
    },
  };

  return await admin.messaging().send(payload);
}

export const sendDataPushNotification = functions.https.onRequest(async (request, response) => {
  const token = request.query.token as string;

  if (!token) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "User device token is required provided as token query parameter."
    );
  }

  const payload = {
    token,
    data: {
      title: "Hello world",
      body: "Sent via cloud function",
    },
  };

  const messageId = await admin.messaging().send(payload);

  response.status(200).send({
    message: "Push notification sent successfully.",
    data: {
      messageId,
      payload,
    },
  });
});

export const sendSimplePushNotification = functions.https.onRequest(async (request, response) => {
  const token = request.query.token as string;

  if (!token) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "User device token is required provided as token query parameter."
    );
  }

  const payload = {
    token,
    notification: {
      title: "Feeling puzzled?",
      body: "Simply ask a question...",
    },
    webpush: {
      notification: {
        title: "WebPush title",
        body: "WebPush body",
      },
      fcmOptions: {
        link: `https://${process.env.GCLOUD_PROJECT}.web.app/entry/new`,
      },
    },
  } as Message;

  const messageId = await admin.messaging().send(payload);

  response.status(200).send({
    message: "Push notification sent successfully.",
    data: {
      messageId,
      payload,
    },
  });
});

export const subscribeToNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Resetting all upvotes requires authentication."
    );
  }

  const token = data.token as string;
  if (!token) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "User device token is required as payload."
    );
  }

  // TODO If the app requires to send a notification directed to a specific user,
  //      then the token could be persisted as part of the "users" collection.

  try {
    const subscribeResponse = await admin.messaging().subscribeToTopic(token, TOPIC);
    functions.logger.warn("Subscribe succeeded", subscribeResponse);
    return true;
  } catch (error) {
    functions.logger.warn("Subscribe failed with error", error);
    return false;
  }
});

export const unsubscribeFromNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Resetting all upvotes requires authentication."
    );
  }

  const token = data.token as string;
  if (!token) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "User device token is required as payload."
    );
  }

  try {
    const unsubscribeResponse = await admin.messaging().unsubscribeFromTopic(token, TOPIC);
    functions.logger.warn("Unsubscribe succeeded", unsubscribeResponse);
    return true;
  } catch (error) {
    functions.logger.warn("Unsubscribe failed with error", error);
    return false;
  }
});
