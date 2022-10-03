import React from 'react';
import { createRoot } from 'react-dom/client';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

import reportWebVitals from './reportWebVitals';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Some Capacitor plugins, including the Camera API, provide the web-based functionality and UI
// via the Ionic PWA Elements library.
// However, this is a also needed so that Chrome on Android shows the "Install app" instead of
// just the "Add to home screen" prompt with a non fully functional service worker and update
// app experience.
defineCustomElements(window);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
