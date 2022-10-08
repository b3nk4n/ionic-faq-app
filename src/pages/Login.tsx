import { useState } from 'react';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonLoading } from '@ionic/react';
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { logIn } from 'ionicons/icons';

import './Login.css';
import { useAuth } from '../context/auth';
import { Redirect } from 'react-router';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState({ loading: false, error: false });
  const { loggedIn } = useAuth();

  if (loggedIn) {
    return <Redirect to="/home" />;
  }

  const handleLogin = async () => {
    setStatus({ loading: true, error: false });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setStatus({ loading: false, error: false });
      console.log({userCredential});
    } catch (error) {
      console.log({error});
      setStatus({ loading: false, error: true });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='ion-padding'>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value ?? '')} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value ?? '')} />
          </IonItem>
        </IonList>
        {status.error && <IonText color="danger">Invalid user or password.</IonText>}

        <IonButton expand="block" onClick={handleLogin}>
          <IonIcon slot="start" icon={logIn} />
          Email Login
        </IonButton>
        <IonLoading isOpen={status.loading} />

      </IonContent>
    </IonPage>
  );
};

export default Login;
