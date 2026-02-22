import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const createChat = async (req, res) => {
    try {
        const { recipientId, postId, postTitle, message } = req.body;
        const { uid, displayName, photoURL } = req.user;

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

export const sendMessage = async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const { uid } = req.user;

        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            return res.status(404).json({ error: 'Chat not found' });
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
        const lastMsgText = text || (attachment ? `[Sent an ${attachment.type}]` : '');
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

export const getChats = async (req, res) => {
    try {
        const { uid } = req.user;

        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', uid)
            .get();

        const chats = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Populate participant details if missing or stale
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const otherUserId = chat.participants.find(p => p !== uid);
            if (!otherUserId) return chat;

            // If we already have details, we could skip, but let's fetch fresh to be safe and fix the "Unknown" issue
            // To optimize, checking if chat.participantDetails?.[otherUserId] exists would be better for reads, 
            // but the user has "Unknown User" now, so let's force fetch at least for missing ones.
            // Let's just fetch for all for simplicty and correctness.

            try {
                const userDoc = await db.collection('users').doc(otherUserId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    return {
                        ...chat,
                        participantDetails: {
                            ...chat.participantDetails,
                            [otherUserId]: {
                                name: userData.displayName || 'Unknown User',
                                photo: userData.photoURL || null,
                                isVerified: userData.isVerified || false
                            }
                        }
                    };
                }
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

export const rejectChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await db.collection('chats').doc(chatId).delete();
        res.json({ message: 'Chat rejected and deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
