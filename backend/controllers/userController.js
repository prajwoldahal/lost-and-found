// File: userController.js
// Description: User Profile Controller: Edits user profiles, retrieves user score leaderboards, and registers avatar uploads.

import { db, auth } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Upload avatar photo to Cloudinary
// Controller Action: Handles requests to uploadAvatar, reads parameters, interacts with database, and sends json results back
export const uploadAvatar = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'avatars');
        const photoURL = result.secure_url;

        // Update Firestore user document
        await db.collection('users').doc(uid).update({ photoURL });

        res.json({ photoURL });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to createUser, reads parameters, interacts with database, and sends json results back
export const createUser = async (req, res) => {
    try {
        const { email, displayName, photoURL } = req.body;
        const { uid } = req.user; // Use UID from verified token

        const userRef = db.collection('users').doc(uid);

        // Only create if it doesn't exist
        const doc = await userRef.get();
        const lowEmail = email?.toLowerCase();
        const isAdminEmail = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';

        if (doc.exists) {
            const data = doc.data();
            // Auto-repair: If this is the admin email but isAdmin is false, fix it
            if (isAdminEmail && !data.isAdmin) {
                await userRef.update({ isAdmin: true, role: 'admin', isVerified: true });
                console.log(`Admin profile repaired for ${email}`);
                return res.status(200).json({ ...data, isAdmin: true, role: 'admin', isVerified: true });
            }
            return res.status(200).json(data);
        }

        const newUser = {
            uid,
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || null,
            isAdmin: isAdminEmail,
            role: isAdminEmail ? 'admin' : 'user',
            isVerified: isAdminEmail, // Admins are auto-verified
            points: 0,
            createdAt: new Date().toISOString()
        };

        await userRef.set(newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getUser, reads parameters, interacts with database, and sends json results back
export const getUser = async (req, res) => {
    try {
        let { uid } = req.params;

        // Support 'me' shortcut
        if (uid === 'me') {
            uid = req.user.uid;
        }

        const userDoc = await db.collection('users').doc(uid).get();

        let data = userDoc.data();
        const lowEmail = data.email?.toLowerCase();
        const isAdminEmail = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';

        // 1. Check for expired suspension
        if (data.status === 'suspended' && data.suspendedUntil) {
            const suspendedUntilDate = new Date(data.suspendedUntil);
            if (new Date() > suspendedUntilDate) {
                console.log(`Suspension expired for ${data.email}. Reactivating...`);
                const updates = {
                    status: 'active',
                    suspendedUntil: null,
                    suspensionReason: null
                };
                await db.collection('users').doc(uid).update(updates);
                data = { ...data, ...updates };
            }
        }

        // 2. Auto-repair for existing profiles (Admin check)
        if (isAdminEmail && !data.isAdmin) {
            await db.collection('users').doc(uid).update({ isAdmin: true, role: 'admin' });
            data = { ...data, isAdmin: true, role: 'admin' };
        }

        // 3. Calculate rank dynamically
        // Rank = (number of users with points > current user's points) + 1
        const points = data.points || 0;
        try {
            const rankSnapshot = await db.collection('users')
                .where('points', '>', points)
                .count()
                .get();
            data.rank = rankSnapshot.data().count + 1;
        } catch (countErr) {
            console.error('Firestore count() not supported, falling back to query:', countErr);
            // Fallback for older firebase-admin versions
            const rankSnapshot = await db.collection('users')
                .where('points', '>', points)
                .get();
            data.rank = rankSnapshot.size + 1;
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to updateUser, reads parameters, interacts with database, and sends json results back
export const updateUser = async (req, res) => {
    try {
        let { uid } = req.params;
        let updates = req.body;

        // Validation for Profile Updates
        if (updates.phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(updates.phoneNumber)) {
                return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
            }
        }

        if (updates.dob) {
            const dobDate = new Date(updates.dob);
            if (dobDate > new Date()) {
                return res.status(400).json({ error: 'Date of birth cannot be in the future' });
            }
        }

        // Support 'me' shortcut
        if (uid === 'me') {
            uid = req.user.uid;
        }

        // Ensure user is updating their own profile
        if (uid !== req.user.uid && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
        }

        // Cast boolean strings from FormData
        if (updates.verificationPending === 'true') updates.verificationPending = true;
        if (updates.verificationPending === 'false') updates.verificationPending = false;

        // Handle ID Verification Files (Cloudinary Migration)
        if (req.files) {
            if (req.files['idFront']) {
                const result = await uploadToCloudinary(req.files['idFront'][0].buffer, 'verifications');
                updates.idFrontUrl = result.secure_url;
                updates.idImageUrl = result.secure_url; // Backward compatibility
            }
            if (req.files['idBack']) {
                const result = await uploadToCloudinary(req.files['idBack'][0].buffer, 'verifications');
                updates.idBackUrl = result.secure_url;
            }
        }

        await db.collection('users').doc(uid).update(updates);
        res.json({ message: 'User updated successfully', updates });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to deleteUser, reads parameters, interacts with database, and sends json results back
export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.user; // Securely take UID from auth token
        const targetUid = req.params.uid;

        // Ensure user is deleting their own account (unless admin)
        if (uid !== targetUid && !req.user.isAdmin) {
            return res.status(403).json({ error: 'You can only delete your own account' });
        }

        // 1. Delete user document from Firestore
        await db.collection('users').doc(targetUid).delete();

        // 2. Delete user's posts
        const postsSnapshot = await db.collection('posts').where('createdBy', '==', targetUid).get();
        const batch = db.batch();
        postsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // 3. Delete user from Firebase Auth
        await auth.deleteUser(targetUid);

        res.json({ message: 'User account and associated data deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getLeaderboard, reads parameters, interacts with database, and sends json results back
export const getLeaderboard = async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .orderBy('points', 'desc')
            .limit(10)
            .get();

        const leaderboard = snapshot.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to update user points
export const updateUserPoints = async (uid, pointsDelta, itemsReturnedDelta = 0, reason = null) => {
    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) return;

        const data = doc.data();
        const newPoints = (data.points || 0) + pointsDelta;
        const newItemsReturned = (data.itemsReturned || 0) + itemsReturnedDelta;

        await userRef.update({
            points: newPoints,
            itemsReturned: newItemsReturned
        });

        // Notify user for gaining points
        if (pointsDelta > 0) {
            try {
                const { createNotification } = await import('../utils/notificationUtils.js');
                const reasonText = reason ? ` ${reason}` : ' your contribution to the community!';
                await createNotification(uid, {
                    type: 'points_gain',
                    message: `⭐ +${pointsDelta} points! You earned ${pointsDelta} points for${reasonText} Your total is now ${newPoints} pts.`,
                    link: '/rewards',
                    data: {
                        pointsDelta,
                        newPoints,
                        reason: reason || null
                    }
                });
            } catch (notifErr) {
                console.error('Failed to send point gain notification:', notifErr);
            }
        }
    } catch (error) {
        console.error(`Error updating points for user ${uid}:`, error);
    }
};

// Report User
// Controller Action: Handles requests to reportUser, reads parameters, interacts with database, and sends json results back
export const reportUser = async (req, res) => {
    try {
        const { uid: reportedUserId } = req.params;
        const { reason, details } = req.body;
        const { uid: reporterId } = req.user;

        if (reportedUserId === reporterId) {
            return res.status(400).json({ error: "You cannot report yourself" });
        }

        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, 'reports');
                photoUrls.push(result.secure_url);
            }
        }

        const reporterDoc = await db.collection('users').doc(reporterId).get();
        const reporterName = reporterDoc.exists ? (reporterDoc.data().displayName || 'Unknown User') : 'Unknown User';

        await db.collection('reports').add({
            reportedUserId,
            reporterId,
            reporterName,
            reason,
            details,
            photoUrls,
            type: 'user',
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: 'User reported successfully' });
    } catch (error) {
        console.error('Error reporting user:', error);
        res.status(500).json({ error: error.message });
    }
};

