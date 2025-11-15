import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: string;
  accountType: 'bank' | 'creditCard' | 'loan';
  type: 'expense' | 'payment' | 'income';
  amount: number;
  category: string;
  date: Date;
  description?: string;
  linkedAccountId?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ['bank', 'creditCard', 'loan'],
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'payment', 'income'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: String,
    linkedAccountId: String,
    tags: [String],
    isRecurring: Boolean,
    recurringId: String,
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
