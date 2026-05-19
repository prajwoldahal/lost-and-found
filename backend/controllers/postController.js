import { db } from '../config/firebase.js';
import { updateUserPoints } from './userController.js';
import { sendProximityAlerts } from '../utils/notificationUtils.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const createPost = async (req, res) => {
    try {
        const { title, description, type, category, date, creatorName, creatorPhoto } = req.body;
        const { uid } = req.user;

        // Parse location if it's a string (from FormData)
        let location = req.body.location;
        if (typeof location === 'string') {
            try {
                location = JSON.parse(location);
            } catch (e) {
                console.error("Failed to parse location:", e);
            }
        }

        let imageUrls = [];
        let videoUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'posts'));
            const results = await Promise.all(uploadPromises);
            results.forEach(result => {
                if (result.resource_type === 'video') {
                    videoUrls.push(result.secure_url);
                } else {
                    imageUrls.push(result.secure_url);
                }
            });
        }

        const postData = {
            title,
            description,
            type,
            category,
            date,
            location,
            locationName: req.body.locationName || `${location?.lat}, ${location?.lng}`,
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : (videoUrls.length > 0 ? videoUrls[0].replace(/\.[^/.]+$/, ".jpg") : ''), // Use video thumbnail if image missing
            imageUrls,
            videoUrls,
            createdBy: uid,
            creatorName: creatorName || req.user.displayName || 'Unknown User',
            creatorPhoto: creatorPhoto || req.user.photoURL || null,
            status: 'pending_approval',
            createdAt: new Date().toISOString()
        };

        const postRef = await db.collection('posts').add(postData);

        // NOTE: Proximity alerts and point rewards are now handled in approvePost (adminController.js)

        res.status(201).json({ id: postRef.id, message: 'Post created and pending admin approval' });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const { type, category, limit = 50 } = req.query;

        let query = db.collection('posts').where('status', '==', 'active');

        if (type) {
            query = query.where('type', '==', type);
        }
        if (category) {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.limit(parseInt(limit)).get();
        let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter out posts from blocked users if authenticated
        if (req.user && req.user.uid) {
            try {
                const blockedSnapshot = await db.collection('users').doc(req.user.uid).collection('blockedUsers').get();
                const blockedIds = blockedSnapshot.docs.map(doc => doc.id);
                if (blockedIds.length > 0) {
                    posts = posts.filter(post => !blockedIds.includes(post.createdBy));
                }
            } catch (err) {
                console.error('Error filtering blocked users:', err);
            }
        }

        // Sort in memory instead of Firestore to avoid composite index requirements
        posts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        res.json(posts);
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
};

export const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('posts').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { uid } = req.user;

        const postRef = db.collection('posts').doc(id);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const postData = postDoc.data();

        // Security check: Only creator or admin can update
        if (postData.createdBy !== uid && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        // Set isEdited flag
        updates.isEdited = true;
        updates.updatedAt = new Date().toISOString();

        await postRef.update(updates);
        res.json({ message: 'Post updated successfully', isEdited: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('posts').doc(id).delete();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('posts')
            .where('createdBy', '==', uid)
            .get();

        let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory to avoid index requirement
        posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reportPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, details } = req.body;
        const { uid } = req.user;

        await db.collection('reports').add({
            postId: id,
            reporterId: uid,
            reason,
            details,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark item as returned
export const markAsReturned = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        const postRef = db.collection('posts').doc(id);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const postData = postDoc.data();

        // Only the post creator can mark it as returned
        if (postData.createdBy !== uid) {
            return res.status(403).json({ error: 'Only the post creator can mark item as returned' });
        }

        await postRef.update({
            status: 'returned',
            returnedAt: new Date().toISOString()
        });

        // Award points to the finder (post creator) for successfully returning the item
        if (postData.type === 'found') {
            // 100 points and 1 increment to itemsReturned
            await updateUserPoints(postData.createdBy, 100, 1, 'successfully helping return a lost item to its owner! 🎉');
        }

        res.json({ message: 'Item marked as returned successfully' });
    } catch (error) {
        console.error('Mark as returned error:', error);
        res.status(500).json({ error: error.message });
    }
};
