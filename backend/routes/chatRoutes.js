// File: chatRoutes.js
// Description: Chat API Endpoints: Defines URLs for inbox threads, message listings, read receipts, and blocking.

import express from 'express';
import { sendMessage, getMessages, getChats, createChat, acceptChat, rejectChat, markChatRead, deleteMessage, blockUser, unblockUser, getBlockedUsers, checkBlockStatus } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Router Endpoint: Listens for incoming GET requests at the path "/"
router.get('/', authMiddleware, getChats);
// Router Endpoint: Listens for incoming POST requests at the path "/create"
router.post('/create', authMiddleware, createChat); // New route for creating request
// Router Endpoint: Listens for incoming POST requests at the path "/messages"
router.post('/messages', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), sendMessage);
// Router Endpoint: Listens for incoming GET requests at the path "/blocked"
router.get('/blocked', authMiddleware, getBlockedUsers);
// Router Endpoint: Listens for incoming GET requests at the path "/block-status/:userId"
router.get('/block-status/:userId', authMiddleware, checkBlockStatus);
// Router Endpoint: Listens for incoming GET requests at the path "/:chatId/messages"
router.get('/:chatId/messages', authMiddleware, getMessages);
// Router Endpoint: Listens for incoming DELETE requests at the path "/:chatId/messages/:messageId"
router.delete('/:chatId/messages/:messageId', authMiddleware, deleteMessage);
// Router Endpoint: Listens for incoming PUT requests at the path "/:chatId/accept"
router.put('/:chatId/accept', authMiddleware, acceptChat); // New accept route
// Router Endpoint: Listens for incoming PUT requests at the path "/:chatId/reject"
router.put('/:chatId/reject', authMiddleware, rejectChat); // New reject route
// Router Endpoint: Listens for incoming PUT requests at the path "/:chatId/read"
router.put('/:chatId/read', authMiddleware, markChatRead); // New mark read route
// Router Endpoint: Listens for incoming POST requests at the path "/block/:userId"
router.post('/block/:userId', authMiddleware, blockUser);
// Router Endpoint: Listens for incoming DELETE requests at the path "/block/:userId"
router.delete('/block/:userId', authMiddleware, unblockUser);

export default router;

