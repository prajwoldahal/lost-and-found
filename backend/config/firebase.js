// File: firebase.js
// Description: Firebase Core Config: Initializes the frontend connection to Google Firebase Auth, Firestore Database, and Cloud Storage.

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with your service account
let serviceAccount;

// Option 1: Use environment variable (for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error('✗ Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
    }
}
// Option 2: Use local file (for development)
else {
    const localPath = join(__dirname, '../firebase-service-account.json');
    if (existsSync(localPath)) {
        try {
            serviceAccount = JSON.parse(readFileSync(localPath, 'utf8'));
            console.log('✓ Firebase Admin: Using service account from firebase-service-account.json');
        } catch (error) {
            console.error('✗ Firebase Admin: Failed to parse local service account file:', error.message);
        }
    }
}

// Initialize Firebase Admin
try {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✓ Firebase Admin SDK initialized successfully');
    } else {
        // Try application default credentials (works in Google Cloud environments)
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'lostandfoundapp-10853'
        });
        console.log('✓ Firebase Admin SDK initialized with application default credentials');
    }
} catch (error) {
    console.warn('⚠ Firebase Admin SDK initialization warning:', error.message);
    console.warn('⚠ Some authentication features may not work without proper credentials');
    console.warn('⚠ To fix: Set FIREBASE_SERVICE_ACCOUNT environment variable with your service account JSON');

    // Initialize with minimal config for development (limited functionality)
    try {
        admin.initializeApp({
            projectId: 'lostandfoundapp-10853'
        });
        console.log('⚠ Firebase Admin SDK initialized in limited mode (development only)');
    } catch (initError) {
        console.error('✗ Failed to initialize Firebase Admin SDK:', initError.message);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
