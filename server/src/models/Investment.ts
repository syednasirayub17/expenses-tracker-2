import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string; // e.g., 'My Mutual Fund Portfolio'
  type: 'stock' | 'sip' | 'other';
  totalValue: number;
  details?: any; // free-form JSON for provider-specific details
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['stock', 'sip', 'other'], required: true },
    totalValue: { type: Number, default: 0 },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

investmentSchema.index({ userId: 1 });

export default mongoose.model<IInvestment>('Investment', investmentSchema);
