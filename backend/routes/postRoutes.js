// File: postRoutes.js
// Description: Post API Endpoints: Defines URLs for post creation, retrieval, updates, reporting, and dashboard feeds.

import express from 'express';
import { createPost, getPosts, getPost, updatePost, deletePost, getUserPosts, reportPost, markAsReturned } from '../controllers/postController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Router Endpoint: Listens for incoming POST requests at the path "/"
router.post('/', authMiddleware, upload.array('images', 5), createPost);
// Router Endpoint: Listens for incoming GET requests at the path "/"
router.get('/', optionalAuthMiddleware, getPosts);
// Router Endpoint: Listens for incoming GET requests at the path "/my-posts"
router.get('/my-posts', authMiddleware, getUserPosts);
// Router Endpoint: Listens for incoming GET requests at the path "/:id"
router.get('/:id', getPost);
// Router Endpoint: Listens for incoming PUT requests at the path "/:id"
router.put('/:id', authMiddleware, updatePost);
// Router Endpoint: Listens for incoming DELETE requests at the path "/:id"
router.delete('/:id', authMiddleware, deletePost);
// Router Endpoint: Listens for incoming POST requests at the path "/:id/report"
router.post('/:id/report', authMiddleware, reportPost);
// Router Endpoint: Listens for incoming PUT requests at the path "/:id/mark-returned"
router.put('/:id/mark-returned', authMiddleware, markAsReturned);

export default router;
