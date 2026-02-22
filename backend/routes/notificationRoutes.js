import express from 'express';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/notifications - Get all notifications for current user
router.get('/', async (req, res) => {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('notifications')
            .doc(uid)
            .collection('items')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('notifications')
            .doc(uid)
            .collection('items')
            .where('read', '==', false)
            .get();

        res.json({ count: snapshot.size });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        await db.collection('notifications')
            .doc(uid)
            .collection('items')
            .doc(id)
            .update({ read: true, readAt: new Date().toISOString() });

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        await db.collection('notifications')
            .doc(uid)
            .collection('items')
            .doc(id)
            .delete();

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
