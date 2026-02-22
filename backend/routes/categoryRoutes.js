import express from 'express';
import { db } from '../config/firebase.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes for categories
router.post('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const categoryData = req.body;
        const docRef = await db.collection('categories').add({
            ...categoryData,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ id: docRef.id, ...categoryData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await db.collection('categories').doc(req.params.id).delete();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
