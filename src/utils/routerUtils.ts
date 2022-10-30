import { UseIonRouterResult } from "@ionic/react";

/**
 * Go back or to home page.
 * @param {UseIonRouterResult} router The Ionic router.
 */
export function goBackOrHome(router: UseIonRouterResult) {
  if (router.canGoBack()) {
    router.goBack();
  } else {
    router.push("/", "forward", "replace");
  }
}

/**
 * Gets the path of the parent page.
 * @param {UseIonRouterResult} router The Ionic router.
 * @return {string} The partent path.
 */
export function parentPath(router: UseIonRouterResult) {
  const indexOfLastSlash = router.routeInfo.pathname.lastIndexOf("/");
  return router.routeInfo.pathname.substring(0, indexOfLastSlash);
}
