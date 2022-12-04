import {
  IonBackButton,
  IonButtons,
  IonItem,
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  getPlatforms,
} from "@ionic/react";
import packageJson from "../../package.json";

const Debug: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton defaultHref='/' />
        </IonButtons>
        <IonTitle>Debug</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen>
      <IonListHeader>
        <IonLabel>App Info</IonLabel>
      </IonListHeader>
      <IonList>
        <IonItem key="__name">
          <IonLabel>{`App Name: ${packageJson.name}`}</IonLabel>
        </IonItem>
        <IonItem key="__version">
          <IonLabel>{`App Version: ${packageJson.version}`}</IonLabel>
        </IonItem>
        {Object.keys(process.env).map((envKey) => (
          <IonItem key={envKey}>
            <IonLabel>{`${envKey}: ${process.env[envKey]}`}</IonLabel>
          </IonItem>
        ))}
      </IonList>

      <IonListHeader>
        <IonLabel>Platforms</IonLabel>
      </IonListHeader>
      <IonList>
        {getPlatforms().map((platform) => (
          <IonItem key={platform}>
            <IonLabel>{platform}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </IonContent>
  </IonPage>
);

export default Debug;
