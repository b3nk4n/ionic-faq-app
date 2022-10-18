import { useEffect, useState } from 'react';

import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonPopover, IonProgressBar, IonSegment, IonSegmentButton, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { add, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { GoogleAuthProvider, linkWithRedirect } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore'; 
import { auth, db } from '../firebaseConfig';
import { toEntry } from '../types/mapper';
import { useAuth } from '../context/auth';
import { Entry } from '../types/model';

import './Home.css';

type SegmentValue = 'public' | 'private';

const Home: React.FC = () => {
  const { userId, anonymous } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [segmentValue, setSegmentValue] = useState<SegmentValue>('public');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
    
      if (segmentValue === 'public') {
        const entries = await fetchPublicEntries();
        setEntries(entries);
      } else if (segmentValue === 'private' && userId) {
        const entries = await fetchPrivateEntries(userId);
        setEntries(entries);
      }

      setLoading(false);
    };

    loadData();
  }, [segmentValue]);

  const continueAsGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await linkWithRedirect(auth.currentUser!, provider);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Home</IonTitle>
          {loading && <IonProgressBar type="indeterminate" color="light"></IonProgressBar>}
          <IonButtons slot="end">
            <IonButton id="open-popover-menu">
              <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
            </IonButton>
            <IonPopover trigger="open-popover-menu" triggerAction="click" dismissOnSelect>
              <IonContent>
                <IonList>
                  {anonymous && (
                    <IonItem button detail={false} onClick={continueAsGoogle}>
                      Continue via Google Login
                    </IonItem>
                  )}
                  <IonItem button detail={false} onClick={() => auth.signOut()}>
                    Logout
                  </IonItem>
                </IonList>
              </IonContent>
            </IonPopover>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonSegment value={segmentValue} onIonChange={e => setSegmentValue(e.detail.value as SegmentValue)}>
          <IonSegmentButton value="public">
            <IonLabel>Public</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="private">
            <IonLabel>Private</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonList>
          {entries.map(entry => (
            <IonItem key={entry.id} routerLink={getDetailsLink(segmentValue, entry.id, userId)} detail>
              <IonText>
              <h3><IonText color="primary">{entry.title}</IonText></h3>
                <p>
                  {entry.content}
                </p>
              </IonText>
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink={getAddLink(segmentValue, userId)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

function getDetailsLink(segmentValue: SegmentValue, id: string, userId?: string): string {
  if (segmentValue === 'public') {
    return `/entries/${id}`;
  }
  if (segmentValue === 'private' && userId) {
    return `/users/${userId}/entries/${id}`;
  }
  
  throw new Error('Unexpected segment value: ' + segmentValue);
}

function getAddLink(segmentValue: SegmentValue, userId?: string): string {
  if (segmentValue === 'public') {
    return '/entry/new';
  }
  if (segmentValue === 'private' && userId) {
    return `/users/${userId}/entry/new`;
  }
  
  throw new Error('Unexpected segment value: ' + segmentValue);
}

async function fetchPublicEntries() {
  // TODO const allPosts = await getDocs(collectionGroup(db, "posts")) as a better way to get docs across users? For the Admin user.

  const querySnapshot = await getDocs(collection(db, 'entries'));
  return querySnapshot.docs.map(toEntry);
}

async function fetchPrivateEntries(userId: string) {
  const querySnapshot = await getDocs(collection(db, 'users', userId, 'entries'));
  return querySnapshot.docs.map(toEntry);
}

export default Home;
