import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditCard extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  cardNumber: string;
  bankName: string;
  limit: number;
  currentBalance: number;
  availableCredit: number;
  dueDate: number;
  linkedBankAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const creditCardSchema = new Schema<ICreditCard>(
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
    cardNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    availableCredit: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    linkedBankAccountId: String,
  },
  {
    timestamps: true,
  }
);

creditCardSchema.index({ userId: 1 });

export default mongoose.model<ICreditCard>('CreditCard', creditCardSchema);
