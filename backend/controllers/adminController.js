// File: adminController.js
// Description: Admin Controller: Handles moderator dashboards, user banning, category resets, and government ID approvals.

import { db, auth as firebaseAuth } from '../config/firebase.js';
import { updateUserPoints } from './userController.js';
import { createNotification, sendProximityAlerts } from '../utils/notificationUtils.js';

// Controller Action: Handles requests to getStats, reads parameters, interacts with database, and sends json results back
export const getStats = async (req, res) => {
    try {
        console.log('📊 Admin Stats Request - User:', req.user?.email, 'UID:', req.user?.uid);

        const postsSnapshot = await db.collection('posts').get();
        const usersSnapshot = await db.collection('users').get();
        const reportsSnapshot = await db.collection('reports').get();

        console.log('📦 Firestore Query Results:');
        console.log('  - Posts:', postsSnapshot.docs.length);
        console.log('  - Users:', usersSnapshot.docs.length);
        console.log('  - Reports:', reportsSnapshot.docs.length);

        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));

        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();

        const lostItems = posts.filter(p => p.type === 'lost').length;
        const foundItems = posts.length - lostItems;

        // Calculate weekly trends (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const weeklyStats = last7Days.map(date => {
            const dayPosts = posts.filter(p => p.createdAt?.startsWith(date));
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                lost: dayPosts.filter(p => p.type === 'lost').length,
                found: dayPosts.filter(p => p.type === 'found').length
            };
        });

        const stats = {
            totalUsers: users.length,
            totalPosts: posts.length,
            flaggedPosts: reportsSnapshot.docs.filter(d => d.data().status === 'pending').length,
            pendingVerifications: users.filter(u => u.verificationPending).length,
            activeUsers: users.length,
            lostItems: lostItems,
            foundItems: foundItems,
            newUsersToday: users.filter(u => u.createdAt >= startOfDay).length,
            newPostsToday: posts.filter(p => p.createdAt >= startOfDay).length,
            recentPosts: [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
            weeklyStats
        };

        console.log('✅ Stats calculated successfully:', {
            totalUsers: stats.totalUsers,
            totalPosts: stats.totalPosts,
            recentPostsCount: stats.recentPosts.length
        });

        res.json(stats);
    } catch (error) {
        console.error('❌ Error in getStats:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to approvePost, reads parameters, interacts with database, and sends json results back
export const approvePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postRef = db.collection('posts').doc(id);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const postData = postDoc.data();

        await postRef.update({ status: 'active' });

        // Trigger proximity alerts
        try {
            await sendProximityAlerts({ id: postDoc.id, ...postData });
        } catch (alertErr) {
            console.error('Failed to send proximity alerts on approval:', alertErr);
        }

        // Reward points if it's a found item
        if (postData.type === 'found' && postData.createdBy) {
            // Get points from settings
            const settingsDoc = await db.collection('system').doc('settings').get();
            const foundPoints = settingsDoc.exists ? (settingsDoc.data().foundItemPoints || 50) : 50;
            await updateUserPoints(postData.createdBy, foundPoints, 0, 'reporting a found item. Keep it up!');
        }

        // Notify the creator
        if (postData.createdBy) {
            await createNotification(postData.createdBy, {
                type: 'post_approved',
                message: `✅ Your post "${postData.title}" has been approved and is now live!`,
                link: `/post/${id}`,
                data: { postId: id }
            });
        }

        // Log the action
        await db.collection('logs').add({
            level: 'info',
            message: `Post "${postData.title}" approved by admin`,
            action: 'post_approved',
            userId: req.user.uid,
            userEmail: req.user.email,
            metadata: { postId: id, postTitle: postData.title, createdBy: postData.createdBy },
            timestamp: new Date()
        });

        res.json({ message: 'Post approved successfully' });
    } catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to rejectPost, reads parameters, interacts with database, and sends json results back
export const rejectPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminUid = req.user.uid;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const postDoc = await db.collection('posts').doc(id).get();
        const postData = postDoc.exists ? postDoc.data() : {};

        // Log the rejection
        await db.collection('logs').add({
            level: 'warning',
            message: `Post "${postData.title || id}" was rejected by admin`,
            action: 'post_rejected',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                postId: id,
                postTitle: postData.title || 'Unknown',
                createdBy: postData.createdBy || null,
                reason: reason
            },
            timestamp: new Date()
        });

        // Delete or mark as rejected? User says "notified if rejected". 
        // We'll delete it to keep feed clean, but notify first.
        if (postData.createdBy) {
            await createNotification(postData.createdBy, {
                type: 'post_rejected',
                message: `❌ Your post "${postData.title || 'Untitled'}" was not approved. Reason: ${reason}`,
                link: '/create-post',
                data: { postTitle: postData.title, reason }
            });
        }

        await db.collection('posts').doc(id).delete();

        res.json({ message: 'Post rejected successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to deletePostAdmin, reads parameters, interacts with database, and sends json results back
export const deletePostAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminUid = req.user.uid;

        // Fetch post data before deleting for the log
        const postDoc = await db.collection('posts').doc(id).get();
        const postData = postDoc.exists ? postDoc.data() : {};

        // Log the deletion with reason
        await db.collection('logs').add({
            level: 'warning',
            message: `Post "${postData.title || id}" was deleted by admin`,
            action: 'post_deleted',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                postId: id,
                postTitle: postData.title || 'Unknown',
                createdBy: postData.createdBy || null,
                creatorName: postData.creatorName || null,
                reason: reason || 'No reason provided'
            },
            timestamp: new Date()
        });

        await db.collection('posts').doc(id).delete();

        // Notify post creator about deletion
        if (postData.createdBy) {
            try {
                await createNotification(postData.createdBy, {
                    type: 'post_deleted',
                    message: `🚨 Your post "${postData.title || 'Untitled'}" was removed by an admin. Reason: ${reason || 'No reason provided'}. If you believe this was a mistake, please contact support.`,
                    link: '/settings?section=support',
                    data: { postId: id, reason: reason || null }
                });
            } catch (notifErr) {
                console.error('Failed to notify post creator:', notifErr);
            }
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getAllPostsAdmin, reads parameters, interacts with database, and sends json results back
export const getAllPostsAdmin = async (req, res) => {
    try {
        const snapshot = await db.collection('posts').get();
        let posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));
        posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getUsers, reads parameters, interacts with database, and sends json results back
export const getUsers = async (req, res) => {
    try {
        console.log('👥 Get Users Request - User:', req.user?.email);
        const usersSnapshot = await db.collection('users').get();

        // Filter out admins from the list
        const users = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => !user.isAdmin);

        console.log('✅ Users retrieved (excluding admins):', users.length);
        res.json(users);
    } catch (error) {
        console.error('❌ Error in getUsers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getReports, reads parameters, interacts with database, and sends json results back
export const getReports = async (req, res) => {
    try {
        const reportsSnapshot = await db.collection('reports').get();
        const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to updateReportStatus, reads parameters, interacts with database, and sends json results back
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.collection('reports').doc(id).update({ status });
        res.json({ message: 'Report status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to syncUsers, reads parameters, interacts with database, and sends json results back
export const syncUsers = async (req, res) => {
    try {
        console.log('Starting user synchronization...');
        // 1. Fetch all users from Firebase Auth
        const listUsersResult = await firebaseAuth.listUsers();
        const authUsers = listUsersResult.users;

        // 2. Fetch all users from Firestore
        const usersSnapshot = await db.collection('users').get();
        const firestoreUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));

        const batch = db.batch();
        let syncedCount = 0;

        // 3. Identify and add missing users to Firestore
        for (const authUser of authUsers) {
            if (!firestoreUserIds.has(authUser.uid)) {
                console.log(`Syncing user: ${authUser.email} (${authUser.uid})`);
                const userRef = db.collection('users').doc(authUser.uid);

                const lowEmail = authUser.email?.toLowerCase();
                const isAdminEmail = lowEmail === 'prajwaldahal3@gmail.com' || lowEmail === 'prajwoldahal3@gmail.com';

                const newUser = {
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown User',
                    photoURL: authUser.photoURL || null,
                    isAdmin: isAdminEmail,
                    role: isAdminEmail ? 'admin' : 'user',
                    points: 0,
                    status: 'active',
                    createdAt: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).toISOString() : new Date().toISOString()
                };

                batch.set(userRef, newUser);
                syncedCount++;
            }
        }

        if (syncedCount > 0) {
            await batch.commit();
        }

        console.log(`Successfully synced ${syncedCount} users.`);
        res.json({
            message: `Successfully synced ${syncedCount} users.`,
            syncedCount
        });
    } catch (error) {
        console.error('Sync Users Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Ban a user
// Controller Action: Handles requests to banUser, reads parameters, interacts with database, and sends json results back
export const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, duration } = req.body; // duration in days or 'permanent'
        const adminUid = req.user.uid;

        if (!reason) {
            return res.status(400).json({ error: 'Ban reason is required' });
        }

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {
            status: 'suspended',
            suspensionReason: reason,
            suspendedAt: new Date().toISOString()
        };

        if (duration !== 'permanent') {
            const until = new Date();
            until.setHours(until.getHours() + (parseFloat(duration) * 24));
            updates.suspendedUntil = until.toISOString();
        } else {
            updates.suspendedUntil = null; // Permanent ban
        }

        await userRef.update(updates);

        // Log the ban action
        await db.collection('logs').add({
            level: 'warning',
            message: `User ${userDoc.data().email} was banned by admin`,
            action: 'user_banned',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                bannedUserId: id,
                bannedUserEmail: userDoc.data().email,
                reason: reason,
                duration: duration,
                suspendedUntil: updates.suspendedUntil
            },
            timestamp: new Date()
        });

        res.json({
            message: 'User banned successfully',
            user: { id, ...userDoc.data(), ...updates }
        });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: error.message });
    }
};

// Unban a user
// Controller Action: Handles requests to unbanUser, reads parameters, interacts with database, and sends json results back
export const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminUid = req.user.uid;

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {
            status: 'active',
            suspensionReason: null,
            suspendedUntil: null,
            suspendedAt: null
        };

        await userRef.update(updates);

        // Log the unban action
        await db.collection('logs').add({
            level: 'info',
            message: `User ${userDoc.data().email} was unbanned by admin`,
            action: 'user_unbanned',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                unbannedUserId: id,
                unbannedUserEmail: userDoc.data().email
            },
            timestamp: new Date()
        });

        res.json({
            message: 'User unbanned successfully',
            user: { id, ...userDoc.data(), ...updates }
        });
    } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({ error: error.message });
    }
};

// Verify User Identity
// Controller Action: Handles requests to verifyUserIdentity, reads parameters, interacts with database, and sends json results back
export const verifyUserIdentity = async (req, res) => {
    try {
        const { id } = req.params;
        const adminUid = req.user.uid;

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {
            isVerified: true,
            verificationPending: false,
            verifiedAt: new Date().toISOString()
        };

        await userRef.update(updates);

        // Award 100 points for verification
        await updateUserPoints(id, 100, 0, 'successfully verifying your identity! 🛡️');

        // Log the verification action
        await db.collection('logs').add({
            level: 'info',
            message: `User ${userDoc.data().email} identity was verified by admin`,
            action: 'user_verified',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                verifiedUserId: id,
                verifiedUserEmail: userDoc.data().email
            },
            timestamp: new Date()
        });

        res.json({ message: 'User identity verified successfully', pointsAwarded: 100 });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: error.message });
    }
};

// Reject User Identity Verification
// Controller Action: Handles requests to rejectUserIdentity, reads parameters, interacts with database, and sends json results back
export const rejectUserIdentity = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminUid = req.user.uid;

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {
            verificationPending: false,
            verificationRejected: true,
            rejectionReason: reason || 'Documents did not meet our verification criteria.',
            rejectedAt: new Date().toISOString()
        };

        await userRef.update(updates);

        // Log the rejection action
        await db.collection('logs').add({
            level: 'warning',
            message: `User ${userDoc.data().email} identity verification was rejected by admin`,
            action: 'user_verification_rejected',
            userId: adminUid,
            userEmail: req.user.email,
            metadata: {
                rejectedUserId: id,
                rejectedUserEmail: userDoc.data().email,
                reason: updates.rejectionReason
            },
            timestamp: new Date()
        });

        res.json({ message: 'User identity verification rejected' });
    } catch (error) {
        console.error('Error rejecting user verification:', error);
        res.status(500).json({ error: error.message });
    }
};
// System Settings
// Controller Action: Handles requests to getSystemSettings, reads parameters, interacts with database, and sends json results back
export const getSystemSettings = async (req, res) => {
    try {
        const doc = await db.collection('system').doc('settings').get();
        if (!doc.exists) {
            // Initialize with defaults
            const defaults = {
                foundItemPoints: 50,
                requireApproval: true,
                maintenanceMode: false,
                mandatoryVerification: false,
                lastUpdated: new Date().toISOString(),
                updatedBy: 'system'
            };
            await db.collection('system').doc('settings').set(defaults);
            return res.json(defaults);
        }
        res.json(doc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to updateSystemSettings, reads parameters, interacts with database, and sends json results back
export const updateSystemSettings = async (req, res) => {
    try {
        const updates = {
            ...req.body,
            lastUpdated: new Date().toISOString(),
            updatedBy: req.user.email
        };

        await db.collection('system').doc('settings').set(updates, { merge: true });

        // Log the change
        await db.collection('logs').add({
            level: 'info',
            message: `System settings updated by ${req.user.email}`,
            action: 'settings_updated',
            userId: req.user.uid,
            userEmail: req.user.email,
            metadata: { updates },
            timestamp: new Date()
        });

        res.json({ message: 'Settings updated successfully', settings: updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
