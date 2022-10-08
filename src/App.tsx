import { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonLoading, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { onAuthStateChanged } from 'firebase/auth';
import AppUpdater from './components/AppUpdater';
import { AuthContext } from './context/auth';
import { auth } from './firebaseConfig';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [authState, setAuthState] = useState({ loading: true, loggedIn: false });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log({ user });
      setAuthState({ loading: false, loggedIn: Boolean(user)});
    })
  }, []);

  if (authState.loading) {
    return <IonLoading isOpen />;
  }

  return (
    <>
      <AppUpdater />
      <IonApp>
        <AuthContext.Provider value={{ loggedIn: authState.loggedIn }}>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/login">
                <Login />
              </Route>
              <Route exact path="/login/register">
                <Register />
              </Route>
              <Route exact path="/home">
                <Home />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </AuthContext.Provider>
      </IonApp>
    </>
  );
}

export default App;
