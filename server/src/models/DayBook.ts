import mongoose, { Document, Schema } from 'mongoose';

export interface IDayBookEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  transactions: mongoose.Types.ObjectId[]; // references to Transaction
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dayBookSchema = new Schema<IDayBookEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    notes: { type: String },
  },
  { timestamps: true }
);

dayBookSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IDayBookEntry>('DayBook', dayBookSchema);
