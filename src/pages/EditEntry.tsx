import { useParams } from "react-router";
import { useEffect, useState } from "react";

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { fetchPrivateEntry, fetchPublicEntry, createEntry, updateEntry } from "../utils/firebaseUtils";
import { goBackOrHome, parentPath } from "../utils/routerUtils";
import { isBlank } from "../utils/stringUtils";
import { cloudUpload } from "ionicons/icons";

interface RouteParams {
    id?: string;
    userId?: string;
}

const EditEntry: React.FC = () => {
  const router = useIonRouter();
  const { id, userId } = useParams<RouteParams>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [showLoading, dismissLoading] = useIonLoading();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showToast] = useIonToast();

  useEffect(() => {
    const loadEntry = async () => {
      if (!id) return;

      await showLoading("Loading entry...");

      const entryData = userId ?
                await fetchPrivateEntry(userId, id) :
                await fetchPublicEntry(id);
      setTitle(entryData.title);
      setContent(entryData.content);

      await dismissLoading();
    };
    loadEntry();
  }, [id]);

  const handleSave = async () => {
    if (isBlank(title) || isBlank(content)) {
      await showToast("Title and content required.", 3000);
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        await updateEntry(title, content, id, userId);
      } else {
        await createEntry(title, content, userId);
      }

      goBackOrHome(router);
    } catch (error: any) {
      console.error({ error });
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = id ? "Edit Entry" : "New Entry";
  const saveButtonTitle = id ? "Update" : "Save";
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref={parentPath(router)} />
          </IonButtons>
          <IonTitle>{pageTitle}</IonTitle>
          <IonButtons slot="secondary">
            <IonButton fill="solid" onClick={handleSave}>
              {isSaving ?
                                <IonSpinner slot="start" name="lines-small" color="primary">Test</IonSpinner> :
                                <IonIcon slot="start" icon={cloudUpload} />}
              {saveButtonTitle}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Title</IonLabel>
          <IonInput type="text" value={title} onIonChange={(e) => setTitle(e.detail.value ?? "")} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Content</IonLabel>
          <IonTextarea value={content} onIonChange={(e) => setContent(e.detail.value ?? "")} autoGrow />
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default EditEntry;
