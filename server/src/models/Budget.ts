import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, category: 1 });

export default mongoose.model<IBudget>('Budget', budgetSchema);
