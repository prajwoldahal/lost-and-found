import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFirebase() {
    try {
        console.log('Testing Firebase Admin SDK...');
        const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'firebase-service-account.json'), 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.firestore();
        console.log('Attempting to fetch posts collection...');
        const snapshot = await db.collection('posts').limit(1).get();
        console.log(`Success! Found ${snapshot.size} posts.`);

        const usersSnapshot = await db.collection('users').limit(1).get();
        console.log(`Success! Found ${usersSnapshot.size} users.`);

        process.exit(0);
    } catch (error) {
        console.error('Firebase test failed:', error);
        process.exit(1);
    }
}

testFirebase();
