// File: api.js
// Description: API Axios Client: Configures network request parameters, registers automated JWT token auth headers, and handles HTTP calls to Node.js backend routes.

import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle expired tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const user = auth.currentUser;

            if (user) {
                try {
                    const newToken = await user.getIdToken(true);
                    localStorage.setItem('token', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Auth: Token refresh failed", refreshError);
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// User API
export const userAPI = {
    create: (data) => api.post('/users', data),
    get: (uid) => api.get(`/users/${uid}`),
    uploadAvatar: (uid, formData) => api.post(`/users/${uid}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (uid, data) => {
        if (data instanceof FormData) {
            return api.put(`/users/${uid}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/users/${uid}`, data);
    },
    delete: (uid) => api.delete(`/users/${uid}`),
    getLeaderboard: () => api.get('/users/leaderboard'),
    report: (uid, data) => {
        if (data instanceof FormData) {
            return api.post(`/users/${uid}/report`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post(`/users/${uid}/report`, data);
    },
};

// Post API
export const postAPI = {
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/posts', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/posts', data);
    },
    getAll: (params) => api.get('/posts', { params }),
    getPost: (id) => api.get(`/posts/${id}`),
    getOne: (id) => api.get(`/posts/${id}`),
    update: (id, data) => api.put(`/posts/${id}`, data),
    delete: (id) => api.delete(`/posts/${id}`),
    getMyPosts: () => api.get('/posts/my-posts'),
    report: (id, data) => api.post(`/posts/${id}/report`, data),
};

// Chat API
export const chatAPI = {
    sendMessage: (data) => {
        if (data instanceof FormData) {
            return api.post('/chats/messages', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/chats/messages', data);
    },
    getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
    getChats: () => api.get('/chats'), // Get current user's chats
    createChat: (data) => api.post('/chats/create', data),
    acceptChat: (chatId) => api.put(`/chats/${chatId}/accept`),
    rejectChat: (chatId) => api.put(`/chats/${chatId}/reject`),
    markRead: (chatId) => api.put(`/chats/${chatId}/read`),
    deleteMessage: (chatId, messageId) => api.delete(`/chats/${chatId}/messages/${messageId}`),
};

// Block API (integrated into chats backend)
export const blockAPI = {
    block: (userId) => api.post(`/chats/block/${userId}`),
    unblock: (userId) => api.delete(`/chats/block/${userId}`),
    getList: () => api.get('/chats/blocked'),
    checkStatus: (userId) => api.get(`/chats/block-status/${userId}`),
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    getPosts: () => api.get('/admin/posts'),
    syncUsers: () => api.post('/admin/sync-users'),
    approvePost: (id) => api.put(`/admin/posts/${id}/approve`),
    rejectPost: (id, reason) => api.put(`/admin/posts/${id}/reject`, { reason }),
    deletePost: (id, reason) => api.delete(`/admin/posts/${id}`, { data: { reason } }),
    getReports: () => api.get('/admin/reports'),
    updateReportStatus: (id, status) => api.put(`/admin/reports/${id}/status`, { status }),
    unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
    verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
    rejectId: (id, data) => api.put(`/admin/users/${id}/reject-verification`, data),
    getSystemSettings: () => api.get('/admin/settings'),
    updateSystemSettings: (data) => api.put('/admin/settings', data),
    getCategories: () => api.get('/categories'),
    addCategory: (data) => api.post('/categories/admin', data),
    deleteCategory: (id) => api.delete(`/categories/admin/${id}`),
};

// Notification API
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`),
};

// Claim API
export const claimAPI = {
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/claims', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/claims', data);
    },
    getMyClaims: () => api.get('/claims/my-claims'),
    getAllAdmin: () => api.get('/claims/admin'),
    updateStatusAdmin: (id, status) => api.put(`/claims/admin/${id}`, { status }),
};

// Log API
export const logAPI = {
    getLogs: (params) => api.get('/logs', { params }),
    createLog: (data) => api.post('/logs', data),
    clearOldLogs: (daysOld) => api.delete(`/logs/clear?daysOld=${daysOld}`),
};

export default api;
