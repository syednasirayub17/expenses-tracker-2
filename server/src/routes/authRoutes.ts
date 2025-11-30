import express from 'express';
import {
  register,
  login,
  complete2FA,
  getProfile,
  updateProfile,
  changePassword,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/complete-2fa', complete2FA);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
