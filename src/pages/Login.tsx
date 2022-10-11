import { useState } from 'react';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonLoading } from '@ionic/react';
import { FacebookAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { logIn, logoFacebook } from 'ionicons/icons';
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';
import { Redirect } from 'react-router';

import './Login.css';

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
      await signInWithEmailAndPassword(auth, email, password);
      setStatus({ loading: false, error: false });
    } catch (error) {
      console.log({error});
      setStatus({ loading: false, error: true });
    }
  };

  const handleFacebookLogin = async () => {
    setStatus({ loading: true, error: false });

    const provider = new FacebookAuthProvider()
    await signInWithRedirect(auth, provider);
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
          Login with Email
        </IonButton>
        <IonButton expand="block" color="secondary" onClick={handleFacebookLogin}>
          <IonIcon slot="start" icon={logoFacebook} />
          Login with Facebook
        </IonButton>

        <IonButton expand="block" fill="clear" routerLink="/login/register">
          Don't have an account?
        </IonButton>

        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  );
};

export default Login;
