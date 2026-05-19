// File: authRoutes.js
// Description: Auth API Endpoints: Defines endpoint URLs for account sync operations and role verification.

import express from 'express';
import { register, login, getProfile, updateUserProfile, adminDashboard } from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public Routes
 */

// POST /api/auth/register - Register a new user
// Router Endpoint: Listens for incoming POST requests at the path "/register"
router.post('/register', register);

// POST /api/auth/login - Simulate login/verify token and return profile
// Router Endpoint: Listens for incoming POST requests at the path "/login"
router.post('/login', login);

/**
 * Protected Routes
 */

// GET /api/auth/profile - Get logged in user profile
// Router Endpoint: Listens for incoming GET requests at the path "/profile"
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile - Update user profile
// Router Endpoint: Listens for incoming PUT requests at the path "/profile"
router.put('/profile', authMiddleware, updateUserProfile);

// GET /api/auth/admin - Admin only dashboard stats
// Router Endpoint: Listens for incoming GET requests at the path "/admin"
router.get('/admin', authMiddleware, adminMiddleware, adminDashboard);


export default router;
