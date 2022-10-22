import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { Entry, EntryData } from "../types/model";
import { toEntry } from "../types/mapper";
import { db } from "../firebaseConfig";

export async function createEntry(data: EntryData, userId?: string): Promise<void> {
    const collRef = userId
        ? collection(db, 'users', userId, 'entries')
        : collection(db, 'entries');
    await addDoc(collRef, data);
}

export async function fetchPublicEntries(): Promise<Entry[]> {
    // TODO const allPosts = await getDocs(collectionGroup(db, "posts")) as a better way to get docs across users? For the Admin user.

    const querySnapshot = await getDocs(collection(db, 'entries'));
    return querySnapshot.docs.map(toEntry);
}

export async function fetchPrivateEntries(userId: string): Promise<Entry[]> {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'entries'));
    return querySnapshot.docs.map(toEntry);
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
