import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonPage, IonPopover, IonTitle, IonToolbar, useIonLoading, useIonRouter } from '@ionic/react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
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
    const router = useIonRouter();
    const { id, userId } = useParams<RouteParams>();
    const [entry, setEntry] = useState<Entry>();
    const [showLoading, dismissLoading] = useIonLoading();

    // TODO reload data after entry is updated. Subscribe snapshot changed?
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
                        <IonBackButton defaultHref='/' />
                    </IonButtons>
                    <IonTitle>{entry.title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton id="open-popover-menu">
                            <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
                        </IonButton>
                        <IonPopover trigger="open-popover-menu" triggerAction="click" dismissOnSelect>
                            <IonContent>
                                <IonList>
                                    <IonItem button detail={false} routerLink={router.routeInfo.pathname + '/edit'}>
                                        Edit
                                    </IonItem>
                                </IonList>
                            </IonContent>
                        </IonPopover>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {entry.content}
            </IonContent>
        </IonPage>
    );
};

export default EntryDetails;