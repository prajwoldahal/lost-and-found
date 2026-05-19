// File: AuthContext.jsx
// Description: Authentication Context: Manages global user login states, handles signup/login routines with Firebase, and synchronizes user profile records with the database backend.

import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onIdTokenChanged,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    verifyBeforeUpdateEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial session setup and auth state listener
    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            // Safety timeout for profile fetch
            const profileTimer = setTimeout(() => {
                if (loading) {
                    console.warn("Auth: Profile fetch timed out, unlocking app...");
                    setLoading(false);
                }
            }, 3000);


            try {
                if (user) {
                    console.log("Auth: User logged in", user.uid);
                    setCurrentUser(user);
                    try {
                        const token = await user.getIdToken();
                        localStorage.setItem('token', token);
                        console.log("Auth: Token stored");

                        let profile;
                        try {
                            console.log("Auth: Fetching profile from backend...");
                            const response = await userAPI.get(user.uid);
                            profile = response.data;
                            console.log("Auth: Profile fetched successfully");

                            // Check provider data (e.g. Google) if top-level photoURL is missing
                            const providerData = user.providerData?.find(p => p.providerId === 'google.com') || user.providerData?.[0];
                            const effectivePhotoURL = user.photoURL || providerData?.photoURL;

                            if (effectivePhotoURL) {
                                console.log("Auth Debug: Effective photoURL found:", effectivePhotoURL);

                                // FIX: If Auth main profile is missing photo but provider has it, update Auth profile triggers
                                if (!user.photoURL && providerData?.photoURL) {
                                    console.log("Auth: Updating Firebase Auth profile with provider photo...");
                                    try {
                                        await updateProfile(user, { photoURL: effectivePhotoURL });
                                    } catch (updateError) {
                                        console.error("Auth: Failed to update Auth profile", updateError);
                                    }
                                }

                                if (!profile.photoURL || profile.photoURL !== effectivePhotoURL) {
                                    console.log("Auth: Syncing Firebase photo to Firestore...");
                                    try {
                                        await userAPI.update(user.uid, { photoURL: effectivePhotoURL });
                                        profile.photoURL = effectivePhotoURL; // Update local profile variable
                                        console.log("Auth: Sync successful.");
                                    } catch (syncError) {
                                        console.error("Auth: Failed to sync photo", syncError);
                                    }
                                }
                            } else {
                                console.log("Auth Debug: No photoURL found in user or providerData.");
                            }
                        } catch (error) {
                            if (error.response && error.response.status === 404) {
                                console.log("Auth: Profile not found, creating new one...");
                                const newProfile = {
                                    uid: user.uid,
                                    email: user.email,
                                    displayName: user.displayName || user.email.split('@')[0],
                                    photoURL: user.photoURL
                                };
                                const createResponse = await userAPI.create(newProfile);
                                profile = createResponse.data.user || createResponse.data;
                                console.log("Auth: New profile created");
                            } else {
                                throw error;
                            }
                        }

                        const lowEmail = user.email?.toLowerCase();
                        const isAppAdmin = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';

                        // Recalculate effective URL for local state
                        const providerData = user.providerData?.find(p => p.providerId === 'google.com') || user.providerData?.[0];
                        const finalPhotoURL = user.photoURL || providerData?.photoURL || profile?.photoURL;

                        setUserData({
                            ...profile,
                            photoURL: finalPhotoURL, // Prioritize Auth/Provider photo
                            isAdmin: isAppAdmin || profile?.isAdmin,
                            role: (isAppAdmin || profile?.role === 'admin') ? 'admin' : 'user'
                        });
                    } catch (error) {
                        console.error('Auth: Failed to sync profile:', error);
                        const lowEmail = user.email?.toLowerCase();
                        const isAppAdmin = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';

                        setUserData({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || user.email.split('@')[0],
                            photoURL: user.photoURL,
                            role: isAppAdmin ? 'admin' : 'user',
                            isAdmin: isAppAdmin,
                            isSyncError: true
                        });
                    }
                } else {
                    console.log("Auth: No user logged in");
                    setCurrentUser(null);
                    setUserData(null);
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error("Auth: State Change Error:", err);
            } finally {
                clearTimeout(profileTimer);
                console.log("Auth: Loading finished");
                setLoading(false);
            }

        });

        return unsubscribe;
    }, []);

    async function sendVerification() {
        if (auth.currentUser) {
            return sendEmailVerification(auth.currentUser);
        }
    }

    // Login with Email/Password
    async function login(email, password) {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Signup with Email/Password
    async function signup(email, password, name) {
        try {
            // Create user in Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Update Auth Profile
            await updateProfile(user, { displayName: name });

            const lowEmail = email.toLowerCase();
            const isAdminEmail = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';
            // Create User Document in Firestore
            const userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL: null,
                role: isAdminEmail ? 'admin' : 'user',
                isAdmin: isAdminEmail,
                isVerified: false,
                points: 0
            };


            await userAPI.create(userProfile);
            setUserData(userProfile);

            // Send verification email
            await sendEmailVerification(user);

            return result;
        } catch (error) {
            console.error('Signup Error:', error);

            // Provide user-friendly error messages
            if (error.code === 'auth/email-already-in-use') {
                const friendlyError = new Error('This email is already in use. If you haven\'t completed your profile, please try logging in or use the "Synchronize Users" feature in the Admin Panel.');
                friendlyError.code = error.code;
                throw friendlyError;
            } else if (error.code === 'auth/weak-password') {
                const friendlyError = new Error('Password should be at least 8 characters long and meet complexity requirements.');
                friendlyError.code = error.code;
                throw friendlyError;
            } else if (error.code === 'auth/invalid-email') {
                const friendlyError = new Error('Please enter a valid email address.');
                friendlyError.code = error.code;
                throw friendlyError;
            }

            throw error;
        }
    }

    // Google Sign-In
    async function loginWithGoogle() {
        try {
            return await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged handles Firestore creation if needed
        } catch (error) {
            console.error('Google Login Error:', error);
            throw error;
        }
    }

    // Logout
    async function logout() {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    // Admin login (wrapper)
    async function adminLogin(email, password) {
        return login(email, password);
    }

    async function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function updateProfileData(data) {
        if (!currentUser) return;
        try {
            await userAPI.update(currentUser.uid, data);

            // Also update Auth profile if display name or photoURL changed
            if (data.displayName || data.photoURL) {
                const updates = {};
                if (data.displayName) updates.displayName = data.displayName;
                if (data.photoURL) updates.photoURL = data.photoURL;
                await updateProfile(currentUser, updates);
            }

            setUserData(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Update Profile Error:', error);
            throw error;
        }
    }

    async function updateUserEmail(newEmail) {
        if (!currentUser) return;
        try {
            await verifyBeforeUpdateEmail(currentUser, newEmail);
        } catch (error) {
            console.error('Update Email Error:', error);
            throw error;
        }
    }

    const value = {
        currentUser,
        userData,
        login,
        adminLogin,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        sendVerification,
        updateProfileData,
        updateUserEmail,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
