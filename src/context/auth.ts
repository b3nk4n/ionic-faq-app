import { FacebookAuthProvider, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth } from '../firebaseConfig';

interface Auth {
    loggedIn: boolean;
    userId?: string;
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
            
            setAuthInit({ loading: false, auth: { loggedIn: Boolean(user), userId: user?.uid }});
        })
        return unsubscribe;
    }, []);

    return authInit;
};
