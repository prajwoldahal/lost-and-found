import express from 'express';
import { createUser, getUser, updateUser, deleteUser, getLeaderboard, reportUser, uploadAvatar } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createUser);
router.get('/leaderboard', authMiddleware, getLeaderboard);
router.get('/:uid', authMiddleware, getUser);
router.put('/:uid', authMiddleware, upload.fields([{ name: 'idFront', maxCount: 1 }, { name: 'idBack', maxCount: 1 }]), updateUser);
router.delete('/:uid', authMiddleware, deleteUser);
router.post('/:uid/report', authMiddleware, reportUser);
router.post('/:uid/avatar', authMiddleware, upload.single('photo'), uploadAvatar);

export default router;
