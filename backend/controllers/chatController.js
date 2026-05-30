// File: chatController.js
// Description: Chat Controller: Manages messaging, creates chat threads, handles read receipts, and registers blocked users.

import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const getAttachmentPlaceholder = (type) => {
    if (!type) return '';
    const article = (type === 'image' || type === 'audio') ? 'an' : 'a';
    return `[Sent ${article} ${type}]`;
};

// Helper: check if either user has blocked the other
const checkBlocked = async (uid1, uid2) => {
    const [block1, block2] = await Promise.all([
        db.collection('users').doc(uid1).collection('blockedUsers').doc(uid2).get(),
        db.collection('users').doc(uid2).collection('blockedUsers').doc(uid1).get()
    ]);
    return {
        blockedByMe: block1.exists,   // uid1 blocked uid2
        blockedByOther: block2.exists  // uid2 blocked uid1
    };
};

// Controller Action: Handles requests to createChat, reads parameters, interacts with database, and sends json results back
export const createChat = async (req, res) => {
    try {
        const { recipientId, postId, postTitle, message } = req.body;
        const { uid, displayName, photoURL } = req.user;

        // Block check
        const blockStatus = await checkBlocked(uid, recipientId);
        if (blockStatus.blockedByMe || blockStatus.blockedByOther) {
            return res.status(403).json({ error: 'Unable to create chat. User unavailable.' });
        }

        // Check if chat already exists
        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', uid)
            .get();

        const existingChat = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(recipientId) && data.postId === postId;
        });

        if (existingChat) {
            return res.status(200).json({ id: existingChat.id, message: 'Chat already exists' });
        }

        // Fetch recipient details
        const recipientDoc = await db.collection('users').doc(recipientId).get();
        let recipientData = { name: 'User', photo: null };
        if (recipientDoc.exists) {
            recipientData = {
                name: recipientDoc.data().displayName || 'User',
                photo: recipientDoc.data().photoURL || null
            };
        }

        // Create new chat
        const chatRef = await db.collection('chats').add({
            participants: [uid, recipientId],
            postId,
            postTitle,
            status: 'pending',
            requesterId: uid,
            createdAt: new Date().toISOString(),
            lastMessage: message,
            lastMessageTime: new Date().toISOString(),
            unreadCount: {
                [recipientId]: 1,
                [uid]: 0
            },
            participantDetails: {
                [uid]: { name: displayName, photo: photoURL },
                [recipientId]: recipientData
            }
        });

        // Add initial message
        await chatRef.collection('messages').add({
            senderId: uid,
            text: message,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ id: chatRef.id, message: 'Chat request sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to sendMessage, reads parameters, interacts with database, and sends json results back
export const sendMessage = async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const { uid } = req.user;

        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Block check
        const otherUid = chatDoc.data().participants.find(p => p !== uid);
        if (otherUid) {
            const blockStatus = await checkBlocked(uid, otherUid);
            if (blockStatus.blockedByMe || blockStatus.blockedByOther) {
                return res.status(403).json({ error: 'Unable to send message. User unavailable.' });
            }
        }

        let attachment = null;
        if (req.files) {
            if (req.files['image']) {
                const result = await uploadToCloudinary(req.files['image'][0].buffer, 'chats/images');
                attachment = { type: 'image', url: result.secure_url };
            } else if (req.files['file']) {
                const result = await uploadToCloudinary(req.files['file'][0].buffer, 'chats/files');
                attachment = { type: 'file', url: result.secure_url, name: req.files['file'][0].originalname };
            } else if (req.files['audio']) {
                const result = await uploadToCloudinary(req.files['audio'][0].buffer, 'chats/audio');
                attachment = { type: 'audio', url: result.secure_url };
            } else if (req.files['video']) {
                const result = await uploadToCloudinary(req.files['video'][0].buffer, 'chats/videos');
                attachment = { type: 'video', url: result.secure_url };
            }
        }

        const messageData = {
            senderId: uid,
            text: text || '',
            createdAt: new Date().toISOString(),
            ...(attachment && { attachment })
        };

        await chatRef.collection('messages').add(messageData);

        // Update last message
        const lastMsgText = text || getAttachmentPlaceholder(attachment?.type);
        await chatRef.update({
            lastMessage: lastMsgText,
            lastMessageTime: new Date().toISOString(),
            [`unreadCount.${chatDoc.data().participants.find(p => p !== uid)}`]: (chatDoc.data().unreadCount?.[chatDoc.data().participants.find(p => p !== uid)] || 0) + 1
        });

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to deleteMessage, reads parameters, interacts with database, and sends json results back
export const deleteMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.params;
        const { uid } = req.user;

        const msgRef = db.collection('chats').doc(chatId).collection('messages').doc(messageId);
        const msgDoc = await msgRef.get();

        if (!msgDoc.exists) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only the sender can delete their own message
        if (msgDoc.data().senderId !== uid) {
            return res.status(403).json({ error: 'You can only delete your own messages' });
        }

        // Soft-delete: mark as deleted so both sides see "This message was deleted"
        await msgRef.update({
            deleted: true,
            text: '',
            attachment: null
        });

        // Update lastMessage on the chat if this was the most recent message
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();
        if (chatDoc.exists && chatDoc.data().lastMessage) {
            // Fetch the last 10 messages to find the most recent non-deleted one without requiring a composite index
            const latestSnap = await chatRef.collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const latestDoc = latestSnap.docs.find(doc => doc.data().deleted !== true);

            if (latestDoc) {
                const latestMsg = latestDoc.data();
                await chatRef.update({
                    lastMessage: latestMsg.text || getAttachmentPlaceholder(latestMsg.attachment?.type),
                    lastMessageTime: latestMsg.createdAt
                });
            } else {
                await chatRef.update({
                    lastMessage: 'This message was deleted',
                    lastMessageTime: new Date().toISOString()
                });
            }
        }

        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getMessages, reads parameters, interacts with database, and sends json results back
export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const snapshot = await db.collection('chats')
            .doc(chatId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getChats, reads parameters, interacts with database, and sends json results back
export const getChats = async (req, res) => {
    try {
        const { uid } = req.user;

        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', uid)
            .get();

        const chats = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Populate participant details and block status
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const otherUserId = chat.participants.find(p => p !== uid);
            if (!otherUserId) return chat;

            try {
                const [userDoc, blockStatus] = await Promise.all([
                    db.collection('users').doc(otherUserId).get(),
                    checkBlocked(uid, otherUserId)
                ]);

                let participantDetails = chat.participantDetails || {};
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    participantDetails = {
                        ...participantDetails,
                        [otherUserId]: {
                            name: userData.displayName || 'Unknown User',
                            photo: userData.photoURL || null,
                            isVerified: userData.isVerified || false
                        }
                    };
                }

                return {
                    ...chat,
                    participantDetails,
                    blockedByMe: blockStatus.blockedByMe,
                    blockedByOther: blockStatus.blockedByOther
                };
            } catch (err) {
                console.error("Error fetching user details for chat:", err);
            }
            return chat;
        }));

        res.json(populatedChats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to acceptChat, reads parameters, interacts with database, and sends json results back
export const acceptChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { uid } = req.user;

        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found' });

        // Verify user is a participant but NOT the requester (only recipient can accept)
        if (chatDoc.data().requesterId === uid) {
            return res.status(400).json({ error: 'You cannot accept your own request' });
        }

        await chatRef.update({ status: 'active' });
        res.json({ message: 'Chat accepted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to rejectChat, reads parameters, interacts with database, and sends json results back
export const rejectChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await db.collection('chats').doc(chatId).delete();
        res.json({ message: 'Chat rejected and deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to markChatRead, reads parameters, interacts with database, and sends json results back
export const markChatRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { uid } = req.user;

        const chatRef = db.collection('chats').doc(chatId);

        // Use dot notation to update nested field without overwriting the whole map
        await chatRef.update({
            [`unreadCount.${uid}`]: 0
        });

        res.json({ message: 'Chat marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Block a user
// Controller Action: Handles requests to blockUser, reads parameters, interacts with database, and sends json results back
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { uid } = req.user;

        if (userId === uid) {
            return res.status(400).json({ error: 'You cannot block yourself' });
        }

        await db.collection('users').doc(uid).collection('blockedUsers').doc(userId).set({
            blockedAt: new Date().toISOString()
        });

        res.json({ message: 'User blocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unblock a user
// Controller Action: Handles requests to unblockUser, reads parameters, interacts with database, and sends json results back
export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { uid } = req.user;

        await db.collection('users').doc(uid).collection('blockedUsers').doc(userId).delete();

        res.json({ message: 'User unblocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get list of blocked user profiles
// Controller Action: Handles requests to getBlockedUsers, reads parameters, interacts with database, and sends json results back
export const getBlockedUsers = async (req, res) => {
    try {
        const { uid } = req.user;

        const snapshot = await db.collection('users').doc(uid).collection('blockedUsers').get();
        const blockedProfiles = await Promise.all(snapshot.docs.map(async (doc) => {
            const userDoc = await db.collection('users').doc(doc.id).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                    uid: doc.id,
                    displayName: userData.displayName || 'User',
                    photoURL: userData.photoURL || null,
                    blockedAt: doc.data().blockedAt
                };
            }
            return { uid: doc.id, displayName: 'Deleted User' };
        }));

        res.json(blockedProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check block status between current user and another user
// Controller Action: Handles requests to checkBlockStatus, reads parameters, interacts with database, and sends json results back
export const checkBlockStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { uid } = req.user;

        const status = await checkBlocked(uid, userId);

        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
