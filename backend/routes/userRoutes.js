// File: userRoutes.js
// Description: User API Endpoints: Defines URLs for avatar uploads, profile updates, and score leaderboards.

import express from 'express';
import { createUser, getUser, updateUser, deleteUser, getLeaderboard, reportUser, uploadAvatar } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Router Endpoint: Listens for incoming POST requests at the path "/"
router.post('/', authMiddleware, createUser);
// Router Endpoint: Listens for incoming GET requests at the path "/leaderboard"
router.get('/leaderboard', authMiddleware, getLeaderboard);
// Router Endpoint: Listens for incoming GET requests at the path "/:uid"
router.get('/:uid', authMiddleware, getUser);
// Router Endpoint: Listens for incoming PUT requests at the path "/:uid"
router.put('/:uid', authMiddleware, upload.fields([{ name: 'idFront', maxCount: 1 }, { name: 'idBack', maxCount: 1 }]), updateUser);
// Router Endpoint: Listens for incoming DELETE requests at the path "/:uid"
router.delete('/:uid', authMiddleware, deleteUser);
// Router Endpoint: Listens for incoming POST requests at the path "/:uid/report"
router.post('/:uid/report', authMiddleware, upload.array('photos', 5), reportUser);
// Router Endpoint: Listens for incoming POST requests at the path "/:uid/avatar"
router.post('/:uid/avatar', authMiddleware, upload.single('photo'), uploadAvatar);

export default router;
