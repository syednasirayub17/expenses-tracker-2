import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import activityLoggerService from '../services/activityLoggerService';

const router = express.Router();

/**
 * @route   GET /api/activity/logs
 * @desc    Get user's activity logs
 * @access  Private
 */
router.get('/logs', protect, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;

        const logs = await activityLoggerService.getUserLogs(userId, limit, skip);

        res.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/activity/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', protect, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;

        const sessions = await activityLoggerService.getActiveSessions(userId);

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/activity/failed-logins
 * @desc    Get recent failed login attempts
 * @access  Private
 */
router.get('/failed-logins', protect, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;

        const count = await activityLoggerService.getFailedLoginAttempts(userId);

        res.json({ count });
    } catch (error) {
        console.error('Error fetching failed logins:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
