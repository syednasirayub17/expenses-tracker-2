import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
