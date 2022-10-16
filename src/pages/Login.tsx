import { useState } from 'react';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonLoading } from '@ionic/react';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect, signInAnonymously } from "firebase/auth";
import { mail, logIn, logoFacebook, logoGoogle, call } from 'ionicons/icons';
import PhoneSignInModal from '../components/PhoneSignInModal';
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';
import { Redirect } from 'react-router';

import './Login.css';


interface Status {
  loading: boolean;
  error?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<Status>({ loading: false });
  const [isPhoneSignInOpen, setIsPhoneSignInOpen] = useState<boolean>(false);
  const { loggedIn } = useAuth();

  if (loggedIn) {
    forceCloseModals();
    return <Redirect to="/home" />;
  }

  const handleLogin = async () => {
    setStatus({ loading: true });

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus({ loading: false });
    } catch (error: any) {
      console.log({error});
      setStatus({ loading: false, error: 'Invalid user or password.' });
    }
  };

  const handleFacebookLogin = async () => {
    setStatus({ loading: true });

    const provider = new FacebookAuthProvider()
    await signInWithRedirect(auth, provider);
  };

  const handleGoogleLogin = async () => {
    setStatus({ loading: true });

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      'login_hint': 'user@example.com'
    });
    await signInWithRedirect(auth, provider);
  };

  const handleGuestLogin = async () => {
    setStatus({ loading: true });
    try {
      await signInAnonymously(auth);
    } catch ({errorCode, errorMessage}) {
      console.log({ errorCode, errorMessage });
      setStatus({ loading: false, error: 'Something went wrong. Please try again.' });
    }
  };

  const handlePhoneLogin = async () => {
    setIsPhoneSignInOpen(true);
  }

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

        {Boolean(status.error) && <IonText color="danger">{status.error}</IonText>}

        <IonButton expand="block" onClick={handleLogin}>
          <IonIcon slot="start" icon={mail} />
          Login with Email
        </IonButton>
        <IonButton expand="block" fill="clear" routerLink="/login/register">
          Don't have an account?
        </IonButton>
        
        <IonButton expand="block" color="secondary" onClick={handleFacebookLogin}>
          <IonIcon slot="start" icon={logoFacebook} />
          Login with Facebook
        </IonButton>
        <IonButton expand="block" color="tertiary" onClick={handleGoogleLogin}>
          <IonIcon slot="start" icon={logoGoogle} />
          Login with Google
        </IonButton>
        <IonButton expand="block" color="success" onClick={handlePhoneLogin}>
          <IonIcon slot="start" icon={call} />
          <IonLabel>Login with Phone</IonLabel>
        </IonButton>
        <IonButton expand="block" color="dark" onClick={handleGuestLogin}>
          <IonIcon slot="start" icon={logIn} />
          Login as Guest
        </IonButton>

        <PhoneSignInModal 
          isOpen={isPhoneSignInOpen}
          onLoginSuccess={(user) => setIsPhoneSignInOpen(false)}
          onCancel= {() => setIsPhoneSignInOpen(false)}
        />

        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  );
};

function forceCloseModals(): void {
  var modals = document.getElementsByTagName("ion-modal");
  [].forEach.call(modals, function (el:any) {
      console.log({forceClosedElement: el});
      el.parentNode.removeChild(el);
  });
}

export default Login;
