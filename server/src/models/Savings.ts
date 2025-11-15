import mongoose, { Document, Schema } from 'mongoose';

export interface ISavings extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  linkedBankAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savingsSchema = new Schema<ISavings>(
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
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    description: String,
    linkedBankAccountId: String,
  },
  {
    timestamps: true,
  }
);

savingsSchema.index({ userId: 1 });

export default mongoose.model<ISavings>('Savings', savingsSchema);
