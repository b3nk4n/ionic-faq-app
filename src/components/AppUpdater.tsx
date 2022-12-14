import React, { useEffect, useState } from "react";

import { IonAlert, useIonLoading } from "@ionic/react";

import * as serviceWorkerRegistration from "../serviceWorkerRegistration";

let serviceWorker: ServiceWorker | null;

/**
 * A simple to use PWA update dialog to inform a user a new version is available.
 *
 * Please note that this component neets to be rendered right from the beginning,
 * because otherwise the window.load event of the service-worker-registrations
 * might be missed.
 * @return {React.FC} App updater component.
 */
const AppUpdater: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showLoading, dismissLoading] = useIonLoading();

  const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
    setShowUpdate(true);
    serviceWorker = registration.waiting;
  };

  const onServiceWorkerSuccess = () => {
    console.log("App installed as a PWA.");
  };

  const updateServiceWorker = () => {
    if (!serviceWorker) {
      return;
    }

    showLoading("Updating app...");

    serviceWorker.onstatechange = () => {
      if (serviceWorker?.state === "activated" && navigator.serviceWorker.controller) {
        dismissLoading();

        // Reload page if waiting was successfully skipped
        window.location.reload();
      }
    };
    serviceWorker.postMessage({ type: "SKIP_WAITING" });
  };

  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: onServiceWorkerUpdate,
      onSuccess: onServiceWorkerSuccess,
    });
  }, []);

  return (
    <IonAlert
      isOpen={showUpdate}
      backdropDismiss={false}
      onDidDismiss={() => setShowUpdate(false)}
      header="Update"
      subHeader="An updated version of this app is available"
      message="Do you want to update now?"
      buttons={[
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            // If rejected, the dialog will show up once again in 24h
            // after the version expires from the cache.
            setShowUpdate(false);
          },
        },
        {
          text: "Ok",
          handler: () => {
            setShowUpdate(false);
            updateServiceWorker();
          },
        },
      ]}
    />
  );
};

export default AppUpdater;
