import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  loanType: string;
  principalAmount: number;
  remainingAmount: number;
  interestRate: number;
  emiAmount: number;
  emiDate: number;
  tenureMonths: number;
  remainingMonths: number;
  linkedBankAccountId?: string;
  paymentMode: 'auto' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
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
    loanType: {
      type: String,
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    emiAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    emiDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    tenureMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    remainingMonths: {
      type: Number,
      required: true,
      min: 0,
    },
    linkedBankAccountId: String,
    paymentMode: {
      type: String,
      enum: ['auto', 'manual'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

loanSchema.index({ userId: 1 });

export default mongoose.model<ILoan>('Loan', loanSchema);
