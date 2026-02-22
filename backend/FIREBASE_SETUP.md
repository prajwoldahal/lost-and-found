# Firebase Setup Guide

## Setting Up Firebase Service Account for Backend

To enable Google authentication and other Firebase Admin features in the backend, you need to configure a Firebase service account.

### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lostandfoundapp-10853**
3. Click the gear icon ⚙️ next to "Project Overview" → **Project Settings**
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** to download the JSON file
7. Save the file securely (e.g., `firebase-service-account.json`)

### Step 2: Configure Environment Variable

You have two options:

#### Option A: Using Environment Variable (Recommended for Production)

1. Open your `.env` file in the `backend` directory
2. Add the following line with the **entire JSON content** as a single line:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"lostandfoundapp-10853",...}
```

**Important**: The entire JSON must be on a single line, or properly escaped.

#### Option B: Using File Path (Easier for Development)

Alternatively, you can modify `backend/config/firebase.js` to read from a file:

```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../firebase-service-account.json'), 'utf8')
);
```

Then place your `firebase-service-account.json` file in the `backend` directory.

### Step 3: Restart Backend Server

After configuring the service account:

```bash
cd backend
npm start
```

You should see: `✓ Firebase Admin SDK initialized successfully`

### Troubleshooting

**Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT"**
- Ensure the JSON is properly formatted
- Check for any line breaks or special characters
- Try using Option B (file path) instead

**Error: "Could not load the default credentials"**
- Make sure you've downloaded the correct service account key
- Verify the JSON contains all required fields (type, project_id, private_key, etc.)

**Limited Mode Warning**
- The backend will run in limited mode without proper credentials
- Google authentication will not work
- Some features may be unavailable

### Security Notes

⚠️ **Never commit service account keys to version control!**

Add to your `.gitignore`:
```
firebase-service-account.json
.env
```

For production deployment:
- Use environment variables
- Store credentials securely (e.g., Google Cloud Secret Manager, AWS Secrets Manager)
- Rotate keys regularly
