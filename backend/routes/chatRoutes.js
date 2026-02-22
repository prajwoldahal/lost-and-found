import express from 'express';
import { sendMessage, getMessages, getChats, createChat, acceptChat, rejectChat, markChatRead } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getChats);
router.post('/create', authMiddleware, createChat); // New route for creating request
router.post('/messages', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), sendMessage);
router.get('/:chatId/messages', authMiddleware, getMessages);
router.put('/:chatId/accept', authMiddleware, acceptChat); // New accept route
router.put('/:chatId/reject', authMiddleware, rejectChat); // New reject route
router.put('/:chatId/read', authMiddleware, markChatRead); // New mark read route

export default router;
