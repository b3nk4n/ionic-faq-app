import { useEffect, useState } from 'react';

import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonPopover, IonProgressBar, IonSegment, IonSegmentButton, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { deletePrivateEntry, deletePublicEntry, onPrivateEntriesUpdated, onPublicEntriesUpdated } from '../utils/firebaseUtils';
import { add, ellipsisHorizontal, ellipsisVertical, heart, trash } from 'ionicons/icons';
import { deleteUser, GoogleAuthProvider, linkWithRedirect } from 'firebase/auth';
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';
import { Entry } from '../types/model';

import './Home.css';

type SegmentValue = 'public' | 'private';

const Home: React.FC = () => {
  const { userId, anonymous } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [segmentValue, setSegmentValue] = useState<SegmentValue>('public');

  useEffect(() => {
    setLoading(true);

    if (segmentValue === 'public') {
      return onPublicEntriesUpdated(entries => {
        setEntries(entries);
        setLoading(false);
      });
    }
    if (segmentValue === 'private' && userId) {
      return onPrivateEntriesUpdated(userId, entries => {
        setEntries(entries);
        setLoading(false);
      });
    }
  }, [segmentValue]);

  const continueAsGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await linkWithRedirect(auth.currentUser!, provider);
  }

  const handleDelete = async (id: string) => {
    if (segmentValue === 'public') {
      await deletePublicEntry(id);
    } else if (segmentValue === 'private' && userId) {
      await deletePrivateEntry(userId, id);
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      return;
    }
    
    try {
      await deleteUser(auth.currentUser)
    } catch (error: any) {
      // User potentially requires re-authentication:
      // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
      console.log({ error });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Home</IonTitle>
          {loading && <IonProgressBar type="indeterminate" color="light"></IonProgressBar>}
          <IonButtons slot="end">
            <IonButton id="home-open-popover-menu"> {/*The ID needs to be unique across pages, otherwise a wrong popover might be triggered.*/}
              <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
            </IonButton>
            <IonPopover trigger="home-open-popover-menu" triggerAction="click" dismissOnSelect>
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
                  {auth.currentUser && (
                    <IonItem button detail={false} onClick={handleDeleteAccount}>
                      Delete account
                    </IonItem>
                  )}
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
            <IonItemSliding key={entry.id}>
              <IonItemOptions side="start">
                <IonItemOption color="success">
                  <IonIcon slot="start" icon={heart} />
                  Like
                </IonItemOption>
              </IonItemOptions>

              <IonItem key={entry.id} routerLink={getDetailsLink(segmentValue, entry.id, userId)} detail>
                <IonText>
                  <h3><IonText color="primary">{entry.title}</IonText></h3>
                  <p>
                    {entry.content}
                  </p>
                </IonText>
              </IonItem>

              <IonItemOptions side="end">
                <IonItemOption color="danger" onClick={() => handleDelete(entry.id)}>
                  <IonIcon slot="start" icon={trash} />
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
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

export default Home;
