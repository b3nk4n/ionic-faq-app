import { UseIonRouterResult } from "@ionic/react";

export function goBackOrHome(router: UseIonRouterResult) {
    if (router.canGoBack()) {
        router.goBack();
    } else {
        router.push('/', 'forward', 'replace');
    }
}

export function parentPath(router: UseIonRouterResult) {
    const indexOfLastSlash = router.routeInfo.pathname.lastIndexOf('/')
    return router.routeInfo.pathname.substring(0, indexOfLastSlash);
}
