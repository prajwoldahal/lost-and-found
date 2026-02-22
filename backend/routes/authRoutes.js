import express from 'express';
import { register, login, getProfile, updateUserProfile, adminDashboard } from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public Routes
 */

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Simulate login/verify token and return profile
router.post('/login', login);

/**
 * Protected Routes
 */

// GET /api/auth/profile - Get logged in user profile
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

// GET /api/auth/admin - Admin only dashboard stats
router.get('/admin', authMiddleware, adminMiddleware, adminDashboard);


export default router;
