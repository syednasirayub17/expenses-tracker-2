import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    fullName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    twoFactorBackupCodes: [{
      type: String
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
