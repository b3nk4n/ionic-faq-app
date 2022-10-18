import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonLoading, useIonRouter, UseIonRouterResult, useIonToast } from '@ionic/react';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { isBlank } from '../utils/stringUtils';
import { cloudUpload } from 'ionicons/icons';
import { EntryData } from '../types/model';
import { toEntry } from '../types/mapper';
import { db } from '../firebaseConfig';

interface RouteParams {
    id?: string;
    userId?: string;
}

const EditEntry: React.FC = () => {
    const router = useIonRouter();
    const { id, userId } = useParams<RouteParams>();
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [showLoading, dismissLoading] = useIonLoading();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showToast] = useIonToast();

    useEffect(() => {
        const loadEntry = async () => {
            if (!id) return;

            await showLoading('Loading entry...');

            const docRef = userId
                ? doc(db, 'users', userId, 'entries', id)
                : doc(db, 'entries', id);
            const docSnapshot = await getDoc(docRef);
            const entry = toEntry(docSnapshot);
            setTitle(entry.title);
            setContent(entry.content);

            await dismissLoading();
        };
        loadEntry();
    }, [id]);

    const handleSave = async () => {
        if (isBlank(title) || isBlank(content)) {
            await showToast('Title and content required.', 3000);
            return;
        }

        setIsSaving(true);
        try {
            if (id) {
                await updateEntry({ title, content }, id, userId);
            } else {
                await createEntry({ title, content }, userId);
            }

            goBackOrHome(router);
        } catch (error: any) {
            console.error({ error });
        } finally {
            setIsSaving(false);
        }
    };

    const pageTitle = id ? 'Edit Entry' : 'New Entry';
    const saveButtonTitle = id ? 'Update' : 'Save';
    const parentPath = router.routeInfo.pathname.substring(0, router.routeInfo.pathname.length - 5);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={parentPath} />
                    </IonButtons>
                    <IonTitle>{pageTitle}</IonTitle>
                    <IonButtons slot="secondary">
                        <IonButton fill="solid" onClick={handleSave}>
                            {isSaving
                                ? <IonSpinner slot="start" name="lines-small" color="primary">Test</IonSpinner>
                                : <IonIcon slot="start" icon={cloudUpload} />}
                            {saveButtonTitle}
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Title</IonLabel>
                    <IonInput type="text" value={title} onIonChange={e => setTitle(e.detail.value ?? '')} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Content</IonLabel>
                    <IonTextarea value={content} onIonChange={e => setContent(e.detail.value ?? '')} autoGrow />
                </IonItem>
            </IonContent>
        </IonPage>
    );
};

export default EditEntry;

function goBackOrHome(router: UseIonRouterResult) {
    if (router.canGoBack()) {
        router.goBack();
    } else {
        router.push('/', 'forward', 'replace');
    }
}

async function updateEntry(data: EntryData, id: string, userId?: string) {
    const docRef = userId
        ? doc(db, 'users', userId, 'entries', id)
        : doc(db, 'entries', id);
    await setDoc(docRef, data);
}

async function createEntry(data: EntryData, userId?: string) {
    const collRef = userId
        ? collection(db, 'users', userId, 'entries')
        : collection(db, 'entries');
    await addDoc(collRef, data);
}
