import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { Entry } from "./model";

export function toEntry(doc: DocumentSnapshot<DocumentData>): Entry {
  return {
    id: doc.id,
    ...doc.data(),
  } as Entry;
}
