import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {
    structuredData: true,
  });
  response.send("Hello from Firebase!");
});

export const helloCaller = functions.https.onCall(() => {
  return "Hi from Firebase!";
});

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
