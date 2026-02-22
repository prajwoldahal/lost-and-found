import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccountPath = join(__dirname, './firebase-service-account.json');
if (!existsSync(serviceAccountPath)) {
    console.error('✗ Error: backend/firebase-service-account.json not found!');
    process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Access the underlying @google-cloud/storage client
const storageClient = admin.storage().bucket('placeholder').storage;

async function setCors() {
    try {
        console.log('🔄 Fetching all buckets for project:', serviceAccount.project_id);
        const [buckets] = await storageClient.getBuckets();

        if (buckets.length === 0) {
            console.error('✗ Error: No buckets found in this project!');
            console.log('💡 Tip: Make sure you have clicked "Get Started" in the Storage tab of the Firebase Console.');
            process.exit(1);
        }

        console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '));

        // Find the best bucket (usually ends in .appspot.com)
        const bucket = buckets.find(b => b.name.endsWith('.appspot.com')) || buckets[0];

        console.log('🎯 Targeting bucket:', bucket.name);

        const corsConfiguration = [
            {
                origin: ['http://localhost:5173'],
                method: ['GET', 'POST', 'PUT', 'DELETE'],
                maxAgeSeconds: 3600,
                responseHeader: ['Content-Type', 'Authorization'],
            },
        ];

        console.log('🔄 Applying CORS configuration...');
        await bucket.setCorsConfiguration(corsConfiguration);
        console.log('✓ CORS configuration set successfully for', bucket.name);

        // Success check
        const [metadata] = await bucket.getMetadata();
        console.log('✅ Current CORS Metadata:', JSON.stringify(metadata.cors, null, 2));
        console.log('\n🚀 You can now try uploading your ID again!');
    } catch (error) {
        console.error('✗ Failed to set CORS:', error.message);
        if (error.message.includes('permission')) {
            console.log('💡 Tip: Ensure your service account has "Storage Admin" permissions in Google Cloud Console.');
        }
    } finally {
        process.exit();
    }
}

setCors();
