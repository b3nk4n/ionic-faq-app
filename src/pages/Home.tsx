import { useEffect, useRef, useState } from "react";

import usePWAInstall from "use-pwa-install";

import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonPopover,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import {
  deletePrivateEntry,
  deletePublicEntry,
  onPrivateEntriesUpdated,
  onPublicEntriesUpdated,
  resetAllUsersPublicUpvotes,
  upvote,
} from "../utils/firebaseUtils";
import {
  add,
  ellipsisHorizontal,
  ellipsisVertical,
  heart,
  trash,
  notifications as notificationsIcon,
} from "ionicons/icons";
import { useWebPushNotifications, hasNotificationPermission } from "../hooks/useWebPushNotifications";
import { deleteUser, GoogleAuthProvider, linkWithRedirect } from "firebase/auth";
// import { useMobilePushNotifications } from "../hooks/useMobilePushNotifications";
import { Clipboard } from "@capacitor/clipboard";
import { useAuth } from "../context/auth";
import { auth } from "../firebaseConfig";
import { Entry } from "../types/model";

import "./Home.css";

type SegmentValue = "public" | "private";

const Home: React.FC = () => {
  const { userId, anonymous } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [segmentValue, setSegmentValue] = useState<SegmentValue>("public");
  const [showToast] = useIonToast();
  const slidingListRef = useRef<HTMLIonListElement | null>(null);
  // const { notifications } = useMobilePushNotifications();
  const { token, deleteMessagingToken, manuallyRequestNotificationPermissions } = useWebPushNotifications();
  const { isInstalled, install } = usePWAInstall();

  useEffect(() => {
    setLoading(true);

    if (segmentValue === "public") {
      return onPublicEntriesUpdated((entries) => {
        setEntries(entries);
        setLoading(false);
      });
    }
    if (segmentValue === "private" && userId) {
      return onPrivateEntriesUpdated(userId, (entries) => {
        setEntries(entries);
        setLoading(false);
      });
    }
  }, [segmentValue]);

  const continueAsGoogle = async () => {
    if (!auth.currentUser) {
      return;
    }

    const provider = new GoogleAuthProvider();
    await linkWithRedirect(auth.currentUser, provider);
  };

  const handleLike = async (id: string) => {
    await slidingListRef.current?.closeSlidingItems();

    const success = await upvote(id);

    if (!success) {
      showToast("You already upvoted on this entry.", 3000);
    }
  };

  const handleDelete = async (id: string) => {
    await slidingListRef.current?.closeSlidingItems();

    if (segmentValue === "public") {
      await deletePublicEntry(id);
    } else if (segmentValue === "private" && userId) {
      await deletePrivateEntry(userId, id);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      return;
    }

    try {
      await deleteUser(auth.currentUser);
    } catch (error: any) {
      // User potentially requires re-authentication:
      // https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user
      console.log({ error });
    }

    await slidingListRef.current?.closeSlidingItems();
  };

  const handleResetAllPublicLikes = async () => {
    if (!userId) return;

    await resetAllUsersPublicUpvotes();
  };

  const handleCopyMessagingTokenToClipboard = async () => {
    if (!token) {
      return;
    }

    await Clipboard.write({
      string: token,
    });

    showToast("Copied token to clipboard.", 3000);
  };

  const handleLogout = async () => {
    // also delete the token to not futher receive any notifications after logout
    await deleteMessagingToken();

    await auth.signOut();
  };

  const notificationsCount = 0;// notifications?.length ?? 0;
  const hasWebNotificationPermissions = hasNotificationPermission();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Home</IonTitle>
          {notificationsCount > 0 && (
            <IonBadge slot="end" color="danger">
              <IonIcon className="badge-notification-icon" icon={notificationsIcon} />
              <IonLabel className="badge-notification-text">{notificationsCount}</IonLabel>
            </IonBadge>
          )}
          {loading && <IonProgressBar type="indeterminate" color="light"></IonProgressBar>}
          <IonButtons slot="end">
            {/* Note that the ID needs to be unique across pages, otherwise a wrong popover might be triggered.*/}
            <IonButton id="home-open-popover-menu">
              <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
            </IonButton>
            <IonPopover trigger="home-open-popover-menu" triggerAction="click" dismissOnSelect>
              <IonContent>
                <IonList>
                  {segmentValue === "public" && userId && (
                    <IonItem button detail={false} onClick={handleResetAllPublicLikes}>
                      Reset all public likes
                    </IonItem>
                  )}
                  {anonymous && (
                    <IonItem button detail={false} onClick={continueAsGoogle}>
                      Continue via Google Login
                    </IonItem>
                  )}
                  {!hasWebNotificationPermissions && (
                    <IonItem button detail={false} onClick={() => manuallyRequestNotificationPermissions()}>
                      Request Web Notification Permissions
                    </IonItem>
                  )}
                  {token && (
                    <IonItem button detail={false} onClick={async () => await deleteMessagingToken()}>
                      Delete Messaging Token
                    </IonItem>
                  )}
                  {token && (
                    <IonItem button detail={false} onClick={handleCopyMessagingTokenToClipboard}>
                      Copy Messaging Token
                    </IonItem>
                  )}
                  <IonItem button detail={false} onClick={handleLogout}>
                    Logout
                  </IonItem>
                  {auth.currentUser && (
                    <IonItem button detail={false} onClick={handleDeleteAccount}>
                      Delete account
                    </IonItem>
                  )}
                  {process.env.REACT_APP_DEBUG_MODE === "true" && (
                    <IonItem button detail={false} routerLink="/debug">
                      Debug
                    </IonItem>
                  )}
                  {!isInstalled && (
                    <IonItem button detail={false} onClick={install}>
                      Install PWA
                    </IonItem>
                  )}
                </IonList>
              </IonContent>
            </IonPopover>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonSegment value={segmentValue} onIonChange={(e) => setSegmentValue(e.detail.value as SegmentValue)}>
          <IonSegmentButton value="public">
            <IonLabel>Public</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="private">
            <IonLabel>Private</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonList ref={slidingListRef}>
          {entries.map((entry) => (
            <IonItemSliding key={entry.id}>
              <IonItemOptions side="start" onIonSwipe={() => handleLike(entry.id)}>
                <IonItemOption color="secondary" onClick={() => handleLike(entry.id)} expandable>
                  <IonIcon slot="start" icon={heart} />
                  Like
                </IonItemOption>
              </IonItemOptions>

              <IonItem key={entry.id} routerLink={getDetailsLink(segmentValue, entry.id, userId)} detail>
                <IonText>
                  <h3><IonText color="primary">{entry.title}</IonText></h3>
                  <p>
                    {entry.content}
                  </p>
                </IonText>
                <IonBadge slot="end" color="secondary">
                  <IonIcon className="badge-like-icon" icon={heart} />
                  {entry.upvotes}
                </IonBadge>
              </IonItem>

              <IonItemOptions side="end" onIonSwipe={() => handleDelete(entry.id)}>
                <IonItemOption color="danger" onClick={() => handleDelete(entry.id)} expandable>
                  <IonIcon slot="start" icon={trash} />
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink={getAddLink(segmentValue, userId)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

function getDetailsLink(segmentValue: SegmentValue, id: string, userId?: string): string {
  if (segmentValue === "public") {
    return `/entries/${id}`;
  }
  if (segmentValue === "private" && userId) {
    return `/users/${userId}/entries/${id}`;
  }

  throw new Error("Unexpected segment value: " + segmentValue);
}

function getAddLink(segmentValue: SegmentValue, userId?: string): string {
  if (segmentValue === "public") {
    return "/entry/new";
  }
  if (segmentValue === "private" && userId) {
    return `/users/${userId}/entry/new`;
  }

  throw new Error("Unexpected segment value: " + segmentValue);
}

export default Home;
