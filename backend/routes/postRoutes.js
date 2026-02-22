import express from 'express';
import { createPost, getPosts, getPost, updatePost, deletePost, getUserPosts, reportPost, markAsReturned } from '../controllers/postController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('images', 5), createPost);
router.get('/', getPosts);
router.get('/my-posts', authMiddleware, getUserPosts);
router.get('/:id', getPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/report', authMiddleware, reportPost);
router.put('/:id/mark-returned', authMiddleware, markAsReturned);

export default router;
