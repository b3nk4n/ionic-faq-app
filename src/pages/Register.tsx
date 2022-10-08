import { useState } from 'react';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonLoading, IonButtons, IonBackButton } from '@ionic/react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '../context/auth';
import { auth } from '../firebaseConfig';
import { Redirect } from 'react-router';
import { logIn } from 'ionicons/icons';

import './Register.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState({ loading: false, error: false });
  const { loggedIn } = useAuth();

  if (loggedIn) {
    return <Redirect to="/home" />;
  }

  const handleRegister = async () => {
    setStatus({ loading: true, error: false });

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Register</IonTitle>
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
        {status.error && <IonText color="danger">Registration failed.</IonText>}

        <IonButton expand="block" onClick={handleRegister}>
          <IonIcon slot="start" icon={logIn} />
          Create Account
        </IonButton>
        <IonLoading isOpen={status.loading} />

      </IonContent>
    </IonPage>
  );
};

export default Register;
