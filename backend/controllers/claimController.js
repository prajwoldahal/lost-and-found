// File: claimController.js
// Description: Claim Controller: Manages lost/found matches, reviews verification documents, and processes rewards points.

import { db } from '../config/firebase.js';
import { updateUserPoints } from './userController.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from '../utils/notificationUtils.js';

// Controller Action: Handles requests to createClaim, reads parameters, interacts with database, and sends json results back
export const createClaim = async (req, res) => {
    try {
        const { postId, itemTitle, idType, idNumber, message } = req.body;
        const { uid } = req.user;

        // Fetch user verification status
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const isVerified = userData?.isVerified || false;

        let idFrontUrl = req.body.idImageUrl || userData?.idFrontUrl || userData?.idImageUrl || null;
        let idBackUrl = req.body.idBackUrl || userData?.idBackUrl || null;

        let evidenceUrls = [];
        let evidenceVideoUrls = [];

        // Handle File Uploads (Cloudinary Migration)
        if (req.files) {
            if (req.files['idFront']) {
                const result = await uploadToCloudinary(req.files['idFront'][0].buffer, 'claims/ids');
                idFrontUrl = result.secure_url;
            }
            if (req.files['idBack']) {
                const result = await uploadToCloudinary(req.files['idBack'][0].buffer, 'claims/ids');
                idBackUrl = result.secure_url;
            }
            if (req.files['evidence']) {
                const uploadPromises = req.files['evidence'].map(file =>
                    uploadToCloudinary(file.buffer, 'claims/evidence')
                );
                const results = await Promise.all(uploadPromises);
                results.forEach(result => {
                    if (result.resource_type === 'video') {
                        evidenceVideoUrls.push(result.secure_url);
                    } else {
                        evidenceUrls.push(result.secure_url);
                    }
                });
            }
        }

        // Only enforce ID if user is not verified
        if (!isVerified && !idFrontUrl) {
            return res.status(400).json({ error: 'ID verification image is required for unverified accounts' });
        }

        const claimRef = await db.collection('claims').add({
            postId,
            itemTitle,
            claimerId: uid,
            claimerName: req.user.displayName || 'Unknown User',
            idType: idType || userData?.idType || 'verified_account',
            idNumber: idNumber || userData?.idNumber || 'verified_account',
            idImageUrl: idFrontUrl,
            idFrontUrl,
            idBackUrl,
            evidenceUrls,
            evidenceVideoUrls,
            message,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ id: claimRef.id, message: 'Claim submitted successfully' });
    } catch (error) {
        console.error('Create claim error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getMyClaims, reads parameters, interacts with database, and sends json results back
export const getMyClaims = async (req, res) => {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('claims')
            .where('claimerId', '==', uid)
            .get();

        const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to getAllClaimsAdmin, reads parameters, interacts with database, and sends json results back
export const getAllClaimsAdmin = async (req, res) => {
    try {
        const snapshot = await db.collection('claims')
            .orderBy('createdAt', 'desc')
            .get();

        const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller Action: Handles requests to updateClaimStatus, reads parameters, interacts with database, and sends json results back
export const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved', 'rejected'

        const claimDoc = await db.collection('claims').doc(id).get();
        if (!claimDoc.exists) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const claimData = claimDoc.data();

        await db.collection('claims').doc(id).update({
            status,
            updatedAt: new Date().toISOString()
        });

        // If approved, we mark the post as 'returned' (Unified status)
        if (status === 'approved') {
            const postRef = db.collection('posts').doc(claimData.postId);
            const postDoc = await postRef.get();

            if (postDoc.exists) {
                const postData = postDoc.data();

                await postRef.update({
                    status: 'returned',
                    claimedBy: claimData.claimerId,
                    resolvedAt: new Date().toISOString(),
                    returnedAt: new Date().toISOString()
                });

                // Reward the person who FOUND the item
                // Found Post: Creator is finder. Lost Post: Claimant is finder.
                const finderId = postData.type === 'found' ? postData.createdBy : claimData.claimerId;

                // 100 points and 1 increment to itemsReturned
                await updateUserPoints(finderId, 100, 1, 'helping reunite a lost item with its owner! 🎉');

                // Notify claimant that claim is approved
                await createNotification(claimData.claimerId, {
                    type: 'claim_approved',
                    message: `Congratulations! Your claim for "${claimData.itemTitle}" has been approved. Please contact the poster to arrange collection.`,
                    link: `/post/${claimData.postId}`,
                    data: {
                        postId: claimData.postId,
                        claimId: id
                    }
                });
            }
        } else if (status === 'rejected') {
            // Notify claimant that claim is rejected
            await createNotification(claimData.claimerId, {
                type: 'claim_rejected',
                message: `Your claim for "${claimData.itemTitle}" was not approved. Check the details for more information.`,
                link: '/settings?section=claims',
                data: {
                    postId: claimData.postId,
                    claimId: id
                }
            });
        }

        res.json({ message: `Claim ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
