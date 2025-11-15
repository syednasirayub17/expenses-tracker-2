import mongoose, { Document, Schema } from 'mongoose';

export interface IBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  accountType: 'savings' | 'current' | 'cash';
  createdAt: Date;
  updatedAt: Date;
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'cash'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bankAccountSchema.index({ userId: 1 });

export default mongoose.model<IBankAccount>('BankAccount', bankAccountSchema);
