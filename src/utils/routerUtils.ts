import { UseIonRouterResult } from "@ionic/react";

export function goBackOrHome(router: UseIonRouterResult) {
    if (router.canGoBack()) {
        router.goBack();
    } else {
        router.push('/', 'forward', 'replace');
    }
}

export function parentPath(router: UseIonRouterResult) {
    const pagePathLength = 5; // TODO used for "/edit": make this dynamic by path splitting
    return router.routeInfo.pathname.substring(0, router.routeInfo.pathname.length - pagePathLength);
}
