import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
import { db, resetAllPublicUpvotes } from "../firebaseConfig";
import { Entry, EntryData } from "../types/model";
import { toEntry } from "../types/mapper";

export async function createEntry(data: EntryData, userId?: string): Promise<void> {
    const collRef = userId
        ? collection(db, 'users', userId, 'entries')
        : collection(db, 'entries');
    await addDoc(collRef, data);
}

export async function fetchPublicEntries(): Promise<Entry[]> {
    const querySnapshot = await getDocs(collection(db, 'entries'));
    return querySnapshot.docs.map(toEntry);
}

export async function fetchPrivateEntries(userId: string): Promise<Entry[]> {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'entries'));
    return querySnapshot.docs.map(toEntry);
}

export function onPublicEntriesUpdated(callback: (entries: Entry[]) => void): Unsubscribe {
    const collRef = collection(db, 'entries');
    return onSnapshot(collRef, snapshot => {
      const entries = snapshot.docs.map(toEntry);
      callback(entries);
    });
}

export function onPrivateEntryUpdated(userId: string, id: string, callback: (entry: Entry) => void): Unsubscribe {
    const docRef = doc(db, 'users', userId, 'entries', id);
    return onSnapshot(docRef, snapshot => {
      const entry = toEntry(snapshot);
      callback(entry);
    });
}

export function onPublicEntryUpdated(id: string, callback: (entry: Entry) => void): Unsubscribe {
    const collRef = doc(db, 'entries', id);
    return onSnapshot(collRef, snapshot => {
      const entry = toEntry(snapshot);
      callback(entry);
    });
}

export function onPrivateEntriesUpdated(userId: string, callback: (entries: Entry[]) => void): Unsubscribe {
    const collRef = collection(db, 'users', userId, 'entries');
    return onSnapshot(collRef, snapshot => {
      const entries = snapshot.docs.map(toEntry);
      callback(entries);
    });
}

export async function fetchPublicEntry(id: string): Promise<Entry> {
    const docRef = doc(db, 'entries', id);
    const docSnapshot = await getDoc(docRef);
    return toEntry(docSnapshot);
}

export async function fetchPrivateEntry(userId: string, id: string): Promise<Entry> {
    const docRef = doc(db, 'users', userId, 'entries', id);
    const docSnapshot = await getDoc(docRef);
    return toEntry(docSnapshot);
}

export async function updateEntry(data: EntryData, id: string, userId?: string): Promise<void> {
    const docRef = userId
        ? doc(db, 'users', userId, 'entries', id)
        : doc(db, 'entries', id);
    await setDoc(docRef, data);
}

export async function deletePublicEntry(id: string): Promise<void> {
    const docRef = doc(db, 'entries', id);
    await deleteDoc(docRef);
}

export async function deletePrivateEntry(userId: string, id: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'entries', id);
    await deleteDoc(docRef);
}

export async function resetAllUsersPublicUpvotes(userId: string): Promise<void> {
    try {
        await resetAllPublicUpvotes();
    } catch (error: any) {
        console.log({ error });
    }
}
