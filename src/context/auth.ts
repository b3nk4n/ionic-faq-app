import { onAuthStateChanged } from 'firebase/auth';
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
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setAuthInit({ loading: false, auth: { loggedIn: Boolean(user), userId: user?.uid }});
        })
        return unsubscribe;
    }, []);

    return authInit;
};
