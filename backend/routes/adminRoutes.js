import express from 'express';
import { getStats, approvePost, rejectPost, deletePostAdmin, getAllPostsAdmin, getUsers, getReports, updateReportStatus, syncUsers, banUser, unbanUser, verifyUserIdentity, rejectUserIdentity, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/reports', getReports);
router.put('/reports/:id/status', updateReportStatus);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.delete('/posts/:id', deletePostAdmin);
// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/posts', getAllPostsAdmin);
router.post('/sync-users', syncUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.put('/users/:id/verify', verifyUserIdentity);
router.put('/users/:id/reject-verification', rejectUserIdentity);

export default router;
