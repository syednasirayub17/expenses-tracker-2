import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; username: string };
    req.userId = decoded.id;

    // Fetch user from database to get username
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = { username: user.username, email: user.email };
      } else {
        // Fallback to decoded token if user not found in DB
        req.user = { username: decoded.username || decoded.id };
      }
    } catch (dbError) {
      // If DB fetch fails, use token data
      req.user = { username: decoded.username || decoded.id };
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
