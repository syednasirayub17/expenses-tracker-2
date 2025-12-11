import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import SystemSettings from '../models/SystemSettings';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';
import activityLoggerService from '../services/activityLoggerService';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if signup is enabled
    const settings = await (SystemSettings as any).getSettings();
    if (!settings.signupEnabled) {
      res.status(403).json({ 
        message: 'Signup is currently disabled. Please contact the administrator.' 
      });
      return;
    }

    const { username, email, password, fullName, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        token: generateToken((user._id as any).toString()),
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { username, email, password } = req.body;

    // Check for user by username or email
    const user = await User.findOne({
      $or: [
        { username: username || email },
        { email: email || username }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Log successful login
      await activityLoggerService.logActivity(
        (user._id as any).toString(),
        'login',
        req,
        true
      );

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Return special response indicating 2FA is required
        return res.json({
          requires2FA: true,
          userId: user._id,
          message: 'Please enter your 2FA code'
        });
      }

      // No 2FA, return normal login response
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      // Log failed login attempt
      if (user) {
        await activityLoggerService.logActivity(
          (user._id as any).toString(),
          'failed_login',
          req,
          false
        );
      }
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete 2FA login and get token
// @route   POST /api/auth/complete-2fa
// @access  Public
export const complete2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Log successful login after 2FA
    await activityLoggerService.logActivity(
      (user._id as any).toString(),
      'login',
      req,
      true
    );

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      token: generateToken((user._id as any).toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if signup is enabled
// @route   GET /api/auth/signup-status
// @access  Public
export const getSignupStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await (SystemSettings as any).getSettings();
    res.json({ 
      signupEnabled: settings.signupEnabled,
      maintenanceMode: settings.maintenanceMode 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      user.email = req.body.email || user.email;
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Log password change
      await activityLoggerService.logActivity(
        req.userId!,
        'password_change',
        req,
        true
      );

      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(401).json({ message: 'Current password is incorrect' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, newPassword } = req.body;

    const user = await User.findOne({ username, email });

    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      res.json({ message: 'Password reset successfully' });
    } else {
      res.status(404).json({ message: 'User not found with that username and email' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
