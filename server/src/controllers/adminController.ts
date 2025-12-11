import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import SystemSettings from '../models/SystemSettings';
import BankAccount from '../models/BankAccount';
import Transaction from '../models/Transaction';

// Get all users with statistics
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret').sort({ createdAt: -1 });
    
    // Get statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const accountCount = await BankAccount.countDocuments({ userId: user._id });
        const transactionCount = await Transaction.countDocuments({ userId: user._id });
        const lastLogin = user.updatedAt; // You can track actual lastLogin separately
        
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stats: {
            accountCount,
            transactionCount,
            lastLogin,
          },
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent self-demotion from admin
    if (req.userId === userId && role === 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot change your own role' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent self-deactivation
    if (req.userId === userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        username: user.username,
        isActive: user.isActive,
      } 
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (req.userId === userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete all user data
    await Promise.all([
      BankAccount.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// Get system settings
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await SystemSettings.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// Update system settings
export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { signupEnabled, maintenanceMode, maxUsersAllowed, allowedDomains } = req.body;
    
    const settings = await SystemSettings.updateSettings({
      signupEnabled,
      maintenanceMode,
      maxUsersAllowed,
      allowedDomains,
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// Create new user (admin only)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    const user = new User({
      username,
      email,
      password, // Should be hashed in pre-save hook
      fullName,
      phone,
      role: role || 'user',
      isActive: true,
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

// Get system statistics
export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalAccounts,
      totalTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      BankAccount.countDocuments(),
      Transaction.countDocuments(),
    ]);

    const recentUsers = await User.find()
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        totalAccounts,
        totalTransactions,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// Change user password
export const changeUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};
