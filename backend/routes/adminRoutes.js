// File: adminRoutes.js
// Description: Admin API Endpoints: Defines secure URLs for moderation, user statistics, claims audit, and user logs.

import express from 'express';
import { getStats, approvePost, rejectPost, deletePostAdmin, getAllPostsAdmin, getUsers, getReports, updateReportStatus, syncUsers, banUser, unbanUser, verifyUserIdentity, rejectUserIdentity, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Router Endpoint: Listens for incoming GET requests at the path "/stats"
router.get('/stats', getStats);
// Router Endpoint: Listens for incoming GET requests at the path "/users"
router.get('/users', getUsers);
// Router Endpoint: Listens for incoming GET requests at the path "/reports"
router.get('/reports', getReports);
// Router Endpoint: Listens for incoming PUT requests at the path "/reports/:id/status"
router.put('/reports/:id/status', updateReportStatus);
// Router Endpoint: Listens for incoming PUT requests at the path "/posts/:id/approve"
router.put('/posts/:id/approve', approvePost);
// Router Endpoint: Listens for incoming PUT requests at the path "/posts/:id/reject"
router.put('/posts/:id/reject', rejectPost);
// Router Endpoint: Listens for incoming DELETE requests at the path "/posts/:id"
router.delete('/posts/:id', deletePostAdmin);
// System Settings
// Router Endpoint: Listens for incoming GET requests at the path "/settings"
router.get('/settings', getSystemSettings);
// Router Endpoint: Listens for incoming PUT requests at the path "/settings"
router.put('/settings', updateSystemSettings);
// Router Endpoint: Listens for incoming GET requests at the path "/posts"
router.get('/posts', getAllPostsAdmin);
// Router Endpoint: Listens for incoming POST requests at the path "/sync-users"
router.post('/sync-users', syncUsers);
// Router Endpoint: Listens for incoming PUT requests at the path "/users/:id/ban"
router.put('/users/:id/ban', banUser);
// Router Endpoint: Listens for incoming PUT requests at the path "/users/:id/unban"
router.put('/users/:id/unban', unbanUser);
// Router Endpoint: Listens for incoming PUT requests at the path "/users/:id/verify"
router.put('/users/:id/verify', verifyUserIdentity);
// Router Endpoint: Listens for incoming PUT requests at the path "/users/:id/reject-verification"
router.put('/users/:id/reject-verification', rejectUserIdentity);

export default router;
