import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

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
    .onCreate(async (_, context) => {
      const { id } = context.params;
      const userId = context.auth?.uid;

      await admin.firestore()
          .collection("activities")
          .add({
            msg: `A new public entry was created with id ${id} by user ${userId}`,
            ts: Date.now(),
          });
    });

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
