import express from 'express';
import { getLogs, createLog, clearOldLogs } from '../controllers/logController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getLogs);
router.post('/', createLog);
router.delete('/clear', clearOldLogs);

export default router;
