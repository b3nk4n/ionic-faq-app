import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonPage, IonPopover, IonTitle, IonToolbar, useIonLoading, useIonRouter } from '@ionic/react';
import { deletePrivateEntry, deletePublicEntry, fetchPrivateEntry, fetchPublicEntry } from '../utils/firebaseUtils';
import { create, ellipsisHorizontal, ellipsisVertical, trash } from 'ionicons/icons';
import { goBackOrHome } from '../utils/routerUtils';
import { Entry } from '../types/model';

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

            const entryData = userId
                ? await fetchPrivateEntry(userId, id)
                : await fetchPublicEntry(id);
            setEntry(entryData);

            await dismissLoading();
        };
        loadEntry();
    }, [id]);

    if (!entry) {
        return null;
    }

    const handleDelete = async (id: string) => {
        if (userId) {
            await deletePrivateEntry(userId, id);
        } else {
            await deletePublicEntry(id);
        }

        goBackOrHome(router);
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
                        <IonButton id="details-open-popover-menu">
                            <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
                        </IonButton>
                        <IonPopover trigger="details-open-popover-menu" triggerAction="click" dismissOnSelect>
                            <IonContent>
                                <IonList>
                                    <IonItem button detail={false} routerLink={router.routeInfo.pathname + '/edit'}>
                                        <IonIcon slot="start" icon={create} />
                                        Edit
                                    </IonItem>
                                    <IonItem button detail={false} onClick={() => handleDelete(entry.id)}>
                                        <IonIcon slot="start" icon={trash} />
                                        Delete
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