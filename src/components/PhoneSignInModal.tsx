import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, User } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebaseConfig";

export type RecaptchaMode = "invisible" | "normal";

interface Props {
    isOpen?: boolean;
    onCancel: () => void;
    onLoginSuccess: (user: User) => void;
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        grecaptcha: any;
    }
}

// @eslint-disable no-unused-var
const PhoneSignInModal = ({ isOpen, onCancel, onLoginSuccess }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState<string>();

  const handleGetCodeInvisibleClick = async (e: any) => {
    e.preventDefault();

    if (!phoneNumber) {
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier("phone-sign-in-container", {
      "size": "invisible",
      "callback": async () => {
        console.log("Invisible reCAPTCHA solved.");
      },
      "expired-callback": (error: any) => {
        console.error({ msg: "reCAPTCHA expired.", error });
      },
    }, auth);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error({ msg: "Error sending SMS.", error });
      await resetRecaptchaVerifier();
    }
  };

  const handleGetCodeNormalClick = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!phoneNumber) {
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier("phone-sign-in-container", {
      "size": "normal",
      "callback": async () => {
        console.log("Normal reCAPTCHA solved.");
      },
      "expired-callback": (error: any) => {
        console.error({ msg: "reCAPTCHA expired.", error });
      },
    }, auth);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error({ msg: "Error sending SMS.", error });
      await resetRecaptchaVerifier();
    }
  };

  const handleResendCode = async () => {
    if (!window.recaptchaVerifier) {
      return;
    }

    if (!phoneNumber) {
      return;
    }

    try {
      await resetRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error({ msg: "Error sending SMS.", error });
    }
  };

  const handleSubmitCodeClick = async () => {
    if (!confirmationResult || !code) {
      return;
    }

    try {
      const result = await confirmationResult.confirm(code);
      onLoginSuccess(result.user);
    } catch (error) {
      console.error({ msg: "Error submitting code.", error });
    }
  };

  const handleCancel = () => {
    setConfirmationResult(null);
    onCancel();
  };

  const confirmationCodeRequested = Boolean(confirmationResult);
  return (
    <IonModal isOpen={isOpen} onIonModalDidDismiss={handleCancel}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Phone Login</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCancel}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Enter your phone number</IonLabel>
          <IonInput
            type="tel"
            placeholder="+1 650-555-1234"
            onIonChange={(e) => setPhoneNumber(e.detail.value ?? "")}
          />
        </IonItem>
        {!confirmationCodeRequested && (
          <>
            <IonButton onClick={handleGetCodeInvisibleClick}>Get code via invisible reCAPTCHA</IonButton>
            <IonButton onClick={handleGetCodeNormalClick}>Get code via normal reCAPTCHA</IonButton>
          </>
        )}
        {confirmationCodeRequested && (
          <IonButton onClick={handleResendCode}>Resend code</IonButton>
        )}
        {/* TODO fix checkmark removed after visible reCAPCTHA resolved with success. */}
        <div id="phone-sign-in-container" />
        {Boolean(confirmationResult) && (
          <>
            <IonItem>
              <IonLabel position="stacked">Enter the code</IonLabel>
              <IonInput type="text" placeholder="123456" onIonChange={(e) => setCode(e.detail.value ?? "")} />
            </IonItem>
            <IonButton onClick={handleSubmitCodeClick}>Submit code</IonButton>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};

async function resetRecaptchaVerifier(): Promise<void> {
  const widgetId = await window.recaptchaVerifier.render();
  window.grecaptcha.reset(widgetId);
}

export default PhoneSignInModal;
