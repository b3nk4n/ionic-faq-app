import { Redirect } from 'react-router';
import { getPlatforms, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonPopover, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';

import './NotFound.css';

const NotFound: React.FC = () => (
  <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>404</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className='full-height'>
          <IonRow className='ion-align-items-center full-height'>
            <IonCol className='ion-text-center'>
              <IonLabel>Page not found.</IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
);

export default NotFound;
