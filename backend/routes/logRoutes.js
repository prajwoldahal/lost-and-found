// File: logRoutes.js
// Description: Log API Endpoints: Defines moderator-only URLs to check system audit trails.

import express from 'express';
import { getLogs, createLog, clearOldLogs } from '../controllers/logController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Router Endpoint: Listens for incoming GET requests at the path "/"
router.get('/', getLogs);
// Router Endpoint: Listens for incoming POST requests at the path "/"
router.post('/', createLog);
// Router Endpoint: Listens for incoming DELETE requests at the path "/clear"
router.delete('/clear', clearOldLogs);

export default router;
