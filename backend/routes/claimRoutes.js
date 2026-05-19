// File: claimRoutes.js
// Description: Claim API Endpoints: Defines URLs to create claims, view personal claim listings, and manage approvals.

import express from 'express';
import { createClaim, getMyClaims, getAllClaimsAdmin, updateClaimStatus } from '../controllers/claimController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// User routes
// Router Endpoint: Listens for incoming POST requests at the path "/"
router.post('/', authMiddleware, upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'evidence', maxCount: 5 }
]), createClaim);
// Router Endpoint: Listens for incoming GET requests at the path "/my-claims"
router.get('/my-claims', authMiddleware, getMyClaims);

// Admin routes
// Router Endpoint: Listens for incoming GET requests at the path "/admin"
router.get('/admin', authMiddleware, adminMiddleware, getAllClaimsAdmin);
// Router Endpoint: Listens for incoming PUT requests at the path "/admin/:id"
router.put('/admin/:id', authMiddleware, adminMiddleware, updateClaimStatus);

export default router;
