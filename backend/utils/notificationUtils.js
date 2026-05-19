// File: notificationUtils.js
// Description: Notification Helper Functions: Automatically generates alert logs and database records on claim updates.

import { db } from '../config/firebase.js';

/**
 * Calculates the distance between two points in KM
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

export const sendProximityAlerts = async (post) => {
    // ... (existing proximity alerts logic)
    try {
        if (!post.location || !post.location.lat || !post.location.lng) return;

        console.log(`Checking proximity alerts for post: ${post.title}`);

        const snapshot = await db.collection('users').get();
        const notificationsBatch = db.batch();
        let notifiedCount = 0;

        snapshot.docs.forEach(doc => {
            const user = doc.data();
            if (user.uid === post.createdBy) return;

            if (user.alertLocation && user.alertLocation.lat) {
                const distance = getDistance(
                    post.location.lat,
                    post.location.lng,
                    user.alertLocation.lat,
                    user.alertLocation.lng
                );

                const radius = user.alertRadius || 5;

                if (distance <= radius) {
                    const notifRef = db.collection('notifications')
                        .doc(user.uid)
                        .collection('items')
                        .doc();

                    notificationsBatch.set(notifRef, {
                        type: 'proximity_alert',
                        message: `New ${post.type} item: "${post.title}" reported near your watch area!`,
                        link: `/post/${post.id}`,
                        data: { postId: post.id, distance: Math.round(distance * 10) / 10 },
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                    notifiedCount++;
                }
            }
        });

        if (notifiedCount > 0) {
            await notificationsBatch.commit();
            console.log(`Sent ${notifiedCount} proximity alerts for post ${post.id}`);
        }

    } catch (error) {
        console.error('Error sending proximity alerts:', error);
    }
};

/**
 * Creates a notification for a specific user
 */
export const createNotification = async (userId, notificationData) => {
    try {
        const notifRef = db.collection('notifications')
            .doc(userId)
            .collection('items')
            .doc();

        const notification = {
            read: false,
            createdAt: new Date().toISOString(),
            ...notificationData
        };

        await notifRef.set(notification);
        return { id: notifRef.id, ...notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
