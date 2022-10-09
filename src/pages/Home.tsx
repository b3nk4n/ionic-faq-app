import { useEffect, useState } from 'react';

import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonPopover, IonText, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { collection, getDocs } from 'firebase/firestore'; 
import { auth, db } from '../firebaseConfig';
import { toEntry } from '../types/mapper';
import { Entry } from '../types/model';

import './Home.css';

const Home: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showLoading, dismissLoading] = useIonLoading();

  useEffect(() => {
    const loadData = async () => {
      await showLoading('Loading entries...');

      const querySnapshot = await getDocs(collection(db, 'entries'));
      const entries = querySnapshot.docs.map(toEntry);
      setEntries(entries);

      await dismissLoading();
    };
    loadData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            <IonButton id="open-popover-menu">
              <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
            </IonButton>
            <IonPopover trigger="open-popover-menu" triggerAction="click" dismissOnSelect>
              <IonContent>
                <IonList>
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
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonListHeader>
          <IonLabel>Entries</IonLabel>
        </IonListHeader>
        <IonList>
          {entries.map(entry => (
            <IonItem key={entry.id} routerLink={`/entries/${entry.id}`}>
              <IonText>
              <h3><IonText color="primary">{entry.title}</IonText></h3>
                <p>
                  {entry.content}
                </p>
              </IonText>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Home;
