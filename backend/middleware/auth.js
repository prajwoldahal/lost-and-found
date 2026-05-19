import { auth, db } from '../config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authLog = path.join(__dirname, '../auth_debug.log');

const logAuth = (msg) => {
    fs.appendFileSync(authLog, `[${new Date().toISOString()}] ${msg}\n`);
};

/**
 * Middleware to verify Firebase ID tokens and attach user profile to req.user
 */
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logAuth(`AUTH_FAILED: Missing or malformed header. Header: ${authHeader ? 'Present' : 'Missing'}`);
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        // 1. Verify the Firebase ID token
        try {
            const decodedToken = await auth.verifyIdToken(token);
            const uid = decodedToken.uid;

            // 2. Load latest user profile from Firestore (Optional)
            const userDoc = await db.collection('users').doc(uid).get();

            // Attach user info to request object
            // Even if profile doesn't exist in Firestore, we attach the validated token data
            req.user = {
                uid: uid,
                email: decodedToken.email,
                ...(userDoc.exists ? userDoc.data() : { isNewUser: true })
            };

            next();

        } catch (verifyError) {
            logAuth(`Token verification error: ${verifyError.message}`);
            console.error('Token verification error:', verifyError.message);

            // Check if Firebase Admin is not properly initialized
            if (verifyError.code === 'auth/argument-error' || verifyError.message.includes('credential')) {
                logAuth('AUTH_CRITICAL: Firebase Admin configuration issue detected');
                return res.status(503).json({
                    error: 'Authentication service not available',
                    message: 'Firebase Admin SDK is not properly configured. Please check server logs.'
                });
            }

            return res.status(401).json({ error: 'Invalid or expired authentication token' });
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

/**
 * Middleware that populates req.user if a valid token is present,
 * but allows the request to continue if no token is provided.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const decodedToken = await auth.verifyIdToken(token);
            const uid = decodedToken.uid;
            const userDoc = await db.collection('users').doc(uid).get();

            req.user = {
                uid: uid,
                email: decodedToken.email,
                ...(userDoc.exists ? userDoc.data() : { isNewUser: true })
            };
        } catch (verifyError) {
            // Silently fail for optional auth
            console.log('Optional auth token verification failed:', verifyError.message);
        }
        next();
    } catch (error) {
        console.error('Optional Auth Middleware Error:', error);
        next();
    }
};

/**
 * Middleware to restrict access to admin users
 */
export const adminMiddleware = async (req, res, next) => {
    try {
        // req.user is populated by authMiddleware which runs before this
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden: Admin access only' });
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Admin authorization failed' });
    }
};
