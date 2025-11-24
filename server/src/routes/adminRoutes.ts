import express from 'express';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// Middleware to check if user is admin
const adminOnly = async (req: any, res: any, next: any) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin only)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get user by ID (admin only)
router.get('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Update user (admin only)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { username, email, role, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', protect, adminOnly, async (req: any, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting yourself
        if ((user._id as any).toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.deleteOne();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get statistics (admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

export default router;
