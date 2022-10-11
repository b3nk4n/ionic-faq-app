import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, AuthErrorCodes } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth } from '../firebaseConfig';

interface Auth {
    loggedIn: boolean;
    userId?: string;
    anonymous?: boolean;
}

interface AuthInit {
    loading: boolean;
    auth?: Auth;
}

export const AuthContext = React.createContext<Auth>({
    loggedIn: false
});

export const useAuth = (): Auth => {
    return useContext(AuthContext);
};

export const useAuthInit = (): AuthInit => {
    const [authInit, setAuthInit] = useState<AuthInit>({ loading: true });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            console.log({ user });

            // TODO Handling account-exists-with-different-credential Errors
            //      https://firebase.google.com/docs/auth/web/facebook-login#expandable-1

            // if (user) {
            //     getRedirectResult(firebaseAuth)
            //         .then(result => {
            //             if (!result) {
            //                 console.log({ result, user });
            //                 return;
            //             }

            //             // This is the signed-in user
            //             const facebookUser = result.user;
            //             console.log({ 
            //                 facebookUser,
            //                 isEqualToUser: JSON.stringify(facebookUser) === JSON.stringify(user)
            //             });

            //             // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            //             const credential = FacebookAuthProvider.credentialFromResult(result);
            //             const token = credential?.accessToken;
            //             console.log({token});
            //         }).catch(error => {
            //             // Handle Errors here.
            //             const errorCode = error?.code;
            //             const errorMessage = error?.message;
            //             // The email of the user's account used.
            //             const email = error?.customData?.email;
            //             // AuthCredential type that was used.
            //             const credential = FacebookAuthProvider.credentialFromError(error);
            //             console.log({ errorCode, errorMessage, email, credential });
            //         });
            // }

            if (user?.isAnonymous) {
                getRedirectResult(firebaseAuth)
                    .catch(error => {
                        if (error?.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
                            console.error('The account cannot be converted because it already exists.');
                        } else {
                            console.error('Unhandled error: ' + error?.code);
                        }
                    });
            }
            
            setAuthInit({ loading: false, auth: { loggedIn: Boolean(user), userId: user?.uid, anonymous: user?.isAnonymous }});
        })
        return unsubscribe;
    }, []);

    return authInit;
};
