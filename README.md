# Ionic FAQ App

An basic FAQ  progressive web app (PWA) for Web, Android and iOS using [Ionic](https://ionicframework.com/)
and [Firebase](https://firebase.google.com/).

### Features
- Firebase Authentication
- Firebase Cloud Firestore
- Firebase Cloud Messaing
- Service Worker with _Install App_ and _Update App_ Prompts

### Demo

Check out the app: https://ionic-faq-app.web.app

### Getting started

First, create an `.env` file in the root folder and set the appropriate `REACT_APP_FIREBASE_API_KEY` from the Firebase console.

Next, to run the app in your web browser, simply run the following command in your terminal:

```
ionic serve
```

And to create a manual build, run:

```
ionic build
```

### Mobile

To copy the latest build to the mobile project:

```
ionic cap copy
```

And to sync the data the other way round, such as after making updates to the native portion of the code (e.g. adding a new plugin):

```
ionic cap sync
```

To open the respective mobile app project:

```
ionic cap open android
ionic cap open ios
```

And finally, to run the app using live reload on mobile:

```
ionic cap run android -l --external
ionic cap run ios -l --external
```

### Deployment

First create a production build:

```
ionic build --prod
```

The production build created in the `build` folder can then be deployed, such as via Firebase Hosting and its `firebase deploy` command.