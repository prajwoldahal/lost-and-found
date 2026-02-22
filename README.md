# Lost & Found Community Website

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config and update `client/src/services/firebase.js`

3. **Set Up Firestore Rules**:
   - Go to Firebase Console > Firestore Database > Rules
   - Copy the rules from the `firestore.rules` file in this project and paste them there.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Create Admin User**:
   - Register a user through the app
   - Go to Firebase Console > Firestore Database
   - Find the user document in the `users` collection
   - Add field: `isAdmin: true` (boolean)

## Features

- ✅ User Authentication (Email/Password, Google OAuth)
- ✅ Create Lost/Found Posts with Images
- ✅ Interactive Map (Leaflet + OpenStreetMap)
- ✅ Location-based Search ("Near Me")
- ✅ Real-time Chat System
- ✅ QR Code Generation
- ✅ Admin Dashboard
- ✅ Bilingual Support (English/Nepali)
- ✅ Responsive Design (Mobile/Tablet/Desktop)

## Tech Stack

- **Frontend**: React.js (Vite), TailwindCSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Leaflet, OpenStreetMap
- **i18n**: react-i18next
