// File: chatService.js
// Description: Chat Service: Helper scripts managing chat listings, message structures, and real-time database listener connections.

import { db, storage } from './firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { chatAPI } from './api';

/**
 * Real-time listener for chat messages
 */
export const listenToChatMessages = (chatId, callback) => {
    if (!chatId) return () => { };

    const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure timestamp is compatible if it's still being written
            timestamp: doc.data().createdAt
        }));
        callback(messages);
    }, (error) => {
        console.error("Error listening to messages:", error);
    });
};

/**
 * Send a message via API (to trigger notifications/backend logic)
 * or via Firestore directly for maximum speed.
 * I'll use the API to ensure backend logic (like notifications) is triggered.
 */
export const sendMessage = async (chatId, senderId, senderName, text, otherUserId) => {
    try {
        await chatAPI.sendMessage({
            chatId,
            text,
            otherUserId // Used for notifications
        });
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};
