import { IonCol, IonContent, IonGrid, IonHeader, IonLabel, IonPage, IonRow, IonTitle, IonToolbar } from "@ionic/react";

import "./NotFound.css";

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
