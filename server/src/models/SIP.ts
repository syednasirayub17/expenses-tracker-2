import mongoose, { Document, Schema } from 'mongoose';

export interface ISIP extends Document {
  userId: mongoose.Types.ObjectId;
  name: string; // fund name
  amount: number; // monthly SIP amount
  startDate: Date;
  frequency: 'monthly' | 'weekly' | 'quarterly';
  isActive: boolean;
  totalInvested?: number;
  createdAt: Date;
  updatedAt: Date;
}

const sipSchema = new Schema<ISIP>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    frequency: { type: String, enum: ['monthly', 'weekly', 'quarterly'], default: 'monthly' },
    isActive: { type: Boolean, default: true },
    totalInvested: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sipSchema.index({ userId: 1 });

export default mongoose.model<ISIP>('SIP', sipSchema);
