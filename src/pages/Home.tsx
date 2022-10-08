import { Redirect } from 'react-router';
import { getPlatforms, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonPopover, IonTitle, IonToolbar } from '@ionic/react';
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';

import './Home.css';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';

const Home: React.FC = () => {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    return <Redirect to="/login" />;
  }

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
          <IonLabel>Detected Platforms</IonLabel>
        </IonListHeader>
        <IonList>
          {getPlatforms().map(platform => (
            <IonItem key={platform}>
              <IonLabel>{platform}</IonLabel>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Home;
