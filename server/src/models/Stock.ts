import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number; // average buy price per share
  currentPrice?: number; // optional, can be updated from API
  exchange?: string; // e.g., NSE, BSE
  createdAt: Date;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    name: String,
    quantity: { type: Number, required: true, min: 0 },
    averagePrice: { type: Number, required: true, min: 0 },
    currentPrice: Number,
    exchange: String,
  },
  { timestamps: true }
);

stockSchema.index({ userId: 1, symbol: 1 });

export default mongoose.model<IStock>('Stock', stockSchema);
