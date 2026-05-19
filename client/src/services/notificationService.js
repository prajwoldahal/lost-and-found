// File: notificationService.js
// Description: Notification Service: Triggers user alerts, updates message unread badge counts, and reads notification databases.

import { db } from './firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    limit,
    where
} from 'firebase/firestore';

/**
 * Real-time listener for user notifications
 */
export const listenToNotifications = (userId, callback, onError) => {
    if (!userId) return () => { };

    // Assuming notifications are stored in: notifications/{userId}/items/{notificationId}
    const q = query(
        collection(db, 'notifications', userId, 'items'),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    }, (error) => {
        console.error("Error listening to notifications:", error);
        if (onError) onError(error);
    });
};
