import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'mutual_fund' | 'stock' | 'crypto' | 'gold';
  name: string;
  symbol?: string; // Ticker symbol for stocks/crypto
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: Date;
  platform?: string; // Zerodha, Groww, Binance, etc.
  notes?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['mutual_fund', 'stock', 'crypto', 'gold'],
      required: true
    },
    name: { type: String, required: true },
    symbol: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    buyPrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    buyDate: { type: Date, required: true },
    platform: { type: String },
    notes: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

investmentSchema.index({ userId: 1, type: 1 });

export default mongoose.model<IInvestment>('Investment', investmentSchema);
