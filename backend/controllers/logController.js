// File: logController.js
// Description: Audit Log Controller: Queries, writes, and prunes administrative security audit logs.

import { db } from '../config/firebase.js';

// Get logs with filtering
// Controller Action: Handles requests to getLogs, reads parameters, interacts with database, and sends json results back
export const getLogs = async (req, res) => {
    try {
        console.log('📋 Get Logs Request - User:', req.user?.email);

        const { level, startDate, endDate, search, limit = 100 } = req.query;

        let logsQuery = db.collection('logs').orderBy('timestamp', 'desc');

        // Filter by level if provided
        if (level && level !== 'all') {
            logsQuery = logsQuery.where('level', '==', level);
        }

        // Filter by date range if provided
        if (startDate) {
            logsQuery = logsQuery.where('timestamp', '>=', new Date(startDate));
        }
        if (endDate) {
            logsQuery = logsQuery.where('timestamp', '<=', new Date(endDate));
        }

        // Limit results
        logsQuery = logsQuery.limit(parseInt(limit));

        const logsSnapshot = await logsQuery.get();
        let logs = logsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp
        }));

        // Filter by search term if provided (client-side filtering for flexibility)
        if (search) {
            const searchLower = search.toLowerCase();
            logs = logs.filter(log =>
                log.message?.toLowerCase().includes(searchLower) ||
                log.action?.toLowerCase().includes(searchLower) ||
                log.userId?.toLowerCase().includes(searchLower)
            );
        }

        console.log('✅ Logs retrieved:', logs.length);
        res.json(logs);
    } catch (error) {
        console.error('❌ Error in getLogs:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new log entry
// Controller Action: Handles requests to createLog, reads parameters, interacts with database, and sends json results back
export const createLog = async (req, res) => {
    try {
        const { level, message, action, metadata } = req.body;

        const logEntry = {
            level: level || 'info',
            message,
            action,
            userId: req.user?.uid || null,
            userEmail: req.user?.email || null,
            metadata: metadata || {},
            timestamp: new Date()
        };

        const logRef = await db.collection('logs').add(logEntry);
        console.log('✅ Log created:', logRef.id);

        res.json({ id: logRef.id, ...logEntry });
    } catch (error) {
        console.error('❌ Error creating log:', error);
        res.status(500).json({ error: error.message });
    }
};

// Clear old logs (optional - for maintenance)
// Controller Action: Handles requests to clearOldLogs, reads parameters, interacts with database, and sends json results back
export const clearOldLogs = async (req, res) => {
    try {
        const { daysOld = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

        const oldLogsSnapshot = await db.collection('logs')
            .where('timestamp', '<', cutoffDate)
            .get();

        const batch = db.batch();
        oldLogsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`✅ Cleared ${oldLogsSnapshot.size} old logs`);
        res.json({
            message: `Cleared ${oldLogsSnapshot.size} logs older than ${daysOld} days`,
            count: oldLogsSnapshot.size
        });
    } catch (error) {
        console.error('❌ Error clearing logs:', error);
        res.status(500).json({ error: error.message });
    }
};
