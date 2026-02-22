import { auth, db } from '../config/firebase.js';

/**
 * Controller for handling authentication and user profiles using Firebase.
 */

// Register a new user
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields: email, password, name' });
        }

        // 1. Create a new user in Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Create corresponding Firestore document
        const userData = {
            uid: userRecord.uid,
            name,
            email,
            isAdmin: false, // Default role
            points: 0,      // Default points
            leaderboardVisible: true,
            createdAt: new Date(),
        };

        await db.collection('users').doc(userRecord.uid).set(userData);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        // Handle common Firebase Auth errors
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Login simulation / ID Token check
// Usually, login is done on the client side using Firebase SDK. 
// The client then sends the ID Token to the backend.
export const login = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'Firebase ID Token is required' });
        }

        // Verify the provided ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Fetch user profile from Firestore
        const userRef = db.collection('users').doc(uid);
        let userDoc = await userRef.get();

        // Auto-register: If user profile doesn't exist, create it (e.g., first Google login)
        if (!userDoc.exists) {
            const newUserData = {
                uid: uid,
                email: email,
                displayName: name || email.split('@')[0],
                photoURL: picture || `https://ui-avatars.com/api/?name=${name || email.split('@')[0]}`,
                isAdmin: false,
                points: 0,
                leaderboardVisible: true,
                createdAt: new Date().toISOString()
            };
            await userRef.set(newUserData);
            userDoc = await userRef.get();
        }

        res.status(200).json({
            message: 'Login successful',
            user: userDoc.data()
        });
    } catch (error) {
        console.error('Login/Verification Error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};


// Get profile (Protected route)
export const getProfile = async (req, res) => {
    // req.user is populated by the authMiddleware
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(req.user);
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const { displayName, photoURL, bio, phone } = req.body;

        const updateData = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (photoURL !== undefined) updateData.photoURL = photoURL;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No data provided for update' });
        }

        await db.collection('users').doc(uid).update(updateData);

        res.json({
            message: 'Profile updated successfully',
            user: { ...req.user, ...updateData }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Admin only route
export const adminDashboard = async (req, res) => {
    res.json({
        message: 'Welcome to the Admin Dashboard',
        stats: {
            totalUsers: 156,
            activePosts: 42,
            reportsPending: 3
        }
    });
};
