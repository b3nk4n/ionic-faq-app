import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { db, resetAllPublicUpvotes, upvoteEntry, subscribeToNotifications } from "../firebaseConfig";
import { Entry, EntryData } from "../types/model";
import { toEntry } from "../types/mapper";

/**
 * Creates a new entry.
 * @param {string} title The title of the entry.
 * @param {string} content The content of the entry.
 * @param {string} [userId] The optional user ID if private.
 */
export async function createEntry(title: string, content: string, userId?: string): Promise<void> {
  const collRef = userId ?
    collection(db, "users", userId, "entries") :
    collection(db, "entries");

  // Please note that the promise does not resolve in OFFLINE mode, as described here:
  // https://github.com/firebase/firebase-js-sdk/issues/6515
  await addDoc(collRef, {
    title,
    content,
    upvotes: 0,
  } as EntryData);
}

/**
 * Fetches all public entries.
 * @return {Promise<Entry[]>} All public entries.
 */
export async function fetchPublicEntries(): Promise<Entry[]> {
  const querySnapshot = await getDocs(collection(db, "entries"));
  return querySnapshot.docs.map(toEntry);
}

/**
 * Fetches all private entries of the user.
 * @param {string} userId The user ID.
 * @return {Promise<Entry[]>} All public entries.
 */
export async function fetchPrivateEntries(userId: string): Promise<Entry[]> {
  const querySnapshot = await getDocs(collection(db, "users", userId, "entries"));
  return querySnapshot.docs.map(toEntry);
}

/**
 * The callback type for updates on a list of entries.
 * @callback entriesCallback
 * @param {Entry[]} entries The updated entries.
 */

/**
 * Registers a callback for updates on public entries.
 * @param {entriesCallback} callback The callback function.
 * @return {Unsubscribe} The unsubscribe function.
 */
export function onPublicEntriesUpdated(callback: (entries: Entry[]) => void): Unsubscribe {
  const collRef = collection(db, "entries");
  const entriesQuery = query(collRef, orderBy("upvotes", "desc"));
  return onSnapshot(entriesQuery, (snapshot) => {
    const entries = snapshot.docs.map(toEntry);
    callback(entries);
  });
}

/**
 * Registers a callback for updates on private entries.
 * @param {string} userId The user ID.
 * @param {entriesCallback} callback The callback function.
 * @return {Unsubscribe} The unsubscribe function.
 */
export function onPrivateEntriesUpdated(userId: string, callback: (entries: Entry[]) => void): Unsubscribe {
  const collRef = collection(db, "users", userId, "entries");
  const entriesQuery = query(collRef, orderBy("upvotes", "desc"));
  return onSnapshot(entriesQuery, (snapshot) => {
    const entries = snapshot.docs.map(toEntry);
    callback(entries);
  });
}

/**
 * The callback type for updates on a single entry.
 * @callback entryCallback
 * @param {Entry} entries The updated entry.
 */

/**
 * Registers a callback for updates on a public entry.
 * @param {string} id The entry ID.
 * @param {entryCallback} callback The callback function.
 * @return {Unsubscribe} The unsubscribe function.
 */
export function onPublicEntryUpdated(id: string, callback: (entry: Entry) => void): Unsubscribe {
  const collRef = doc(db, "entries", id);
  return onSnapshot(collRef, (snapshot) => {
    const entry = toEntry(snapshot);
    callback(entry);
  });
}

/**
 * Registers a callback for updates on a private entry.
 * @param {string} userId The user ID.
 * @param {string} id The entry ID.
 * @param {entryCallback} callback The callback function.
 * @return {Unsubscribe} The unsubscribe function.
 */
export function onPrivateEntryUpdated(userId: string, id: string, callback: (entry: Entry) => void): Unsubscribe {
  const docRef = doc(db, "users", userId, "entries", id);
  return onSnapshot(docRef, (snapshot) => {
    const entry = toEntry(snapshot);
    callback(entry);
  });
}

/**
 * Feteches a public entry.
 * @param {string} id The entry ID.
 * @return {Promise<Entry>} The public entry.
 */
export async function fetchPublicEntry(id: string): Promise<Entry> {
  const docRef = doc(db, "entries", id);
  const docSnapshot = await getDoc(docRef);
  return toEntry(docSnapshot);
}

/**
 * Feteches a private entry.
 * @param {string} userId The user ID.
 * @param {string} id The entry ID.
 * @return {Promise<Entry>} The private entry.
 */
export async function fetchPrivateEntry(userId: string, id: string): Promise<Entry> {
  const docRef = doc(db, "users", userId, "entries", id);
  const docSnapshot = await getDoc(docRef);
  return toEntry(docSnapshot);
}

/**
 * Updates a public or private entry.
 * @param {string} title The title of the entry.
 * @param {string} content The content of the entry.
 * @param {string} id The ID of the entry to update.
 * @param {string} [userId] The user ID if private.
 */
export async function updateEntry(title: string, content: string, id: string, userId?: string): Promise<void> {
  const docRef = userId ?
    doc(db, "users", userId, "entries", id) : doc(db, "entries", id);
  await updateDoc(docRef, {
    title,
    content,
  });
}

/**
 * Deletes a public entry.
 * @param {string} id The entry ID.
 */
export async function deletePublicEntry(id: string): Promise<void> {
  const docRef = doc(db, "entries", id);
  await deleteDoc(docRef);
}

/**
 * Deletes a private entry.
 * @param {string} userId The user ID.
 * @param {string} id The entry ID.
 */
export async function deletePrivateEntry(userId: string, id: string): Promise<void> {
  const docRef = doc(db, "users", userId, "entries", id);
  await deleteDoc(docRef);
}

/**
 * Resets all public upvotes of the signed-in user.
 */
export async function resetAllUsersPublicUpvotes(): Promise<void> {
  try {
    await resetAllPublicUpvotes();
  } catch (error) {
    console.log({ error });
  }
}

/**
 * Upvote an entry by ID.
 * @param {string} id The entry ID.
 * @return {Promise<boolean>} True if the upvote was successful.
 */
export async function upvote(id: string): Promise<boolean> {
  try {
    await upvoteEntry({
      id,
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Subscribes to notification when a new public entry is written.
 * @param {string} token The registration token.
 * @return {Promise<boolean>} True if subscribed successful.
 */
export async function subscribeToNewEntries(token: string): Promise<boolean> {
  try {
    const result = await subscribeToNotifications({
      token,
    });
    return result.data;
  } catch (error) {
    return false;
  }
}
