import express from 'express';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  createUser,
  getSystemSettings,
  updateSystemSettings,
  getSystemStats,
  changeUserPassword,
} from '../controllers/adminController';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.put('/users/:userId/password', changeUserPassword);
router.delete('/users/:userId', deleteUser);

// System settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Statistics
router.get('/stats', getSystemStats);

export default router;
