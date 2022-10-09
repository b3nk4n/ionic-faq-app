import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { doc, getDoc } from 'firebase/firestore';
import { toEntry } from '../types/mapper';
import { Entry } from '../types/model';
import { db } from '../firebaseConfig';

import './EntryDetails.css';

interface RouteParams {
    id: string;
    userId?: string;
}

const EntryDetails: React.FC = () => {

    const { id, userId } = useParams<RouteParams>();
    const [ entry, setEntry ] = useState<Entry>();
    const [showLoading, dismissLoading] = useIonLoading();

    useEffect(() => {
        const loadEntry = async () => {
            await showLoading('Loading entry...');

            const docRef = userId
                ? doc(db, 'users', userId, 'entries', id)
                : doc(db, 'entries', id);
            const docSnapshot = await getDoc(docRef);
            const entryData = toEntry(docSnapshot);
            setEntry(entryData);

            await dismissLoading();
        };
        loadEntry();
    }, [id]);

    if (!entry) {
        return null;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton />
                    </IonButtons>
                    <IonTitle>{entry.title}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {entry.content}
            </IonContent>
        </IonPage>
    );
};

export default EntryDetails;