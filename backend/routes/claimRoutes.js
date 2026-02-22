import express from 'express';
import { createClaim, getMyClaims, getAllClaimsAdmin, updateClaimStatus } from '../controllers/claimController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// User routes
router.post('/', authMiddleware, upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'evidence', maxCount: 5 }
]), createClaim);
router.get('/my-claims', authMiddleware, getMyClaims);

// Admin routes
router.get('/admin', authMiddleware, adminMiddleware, getAllClaimsAdmin);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateClaimStatus);

export default router;
