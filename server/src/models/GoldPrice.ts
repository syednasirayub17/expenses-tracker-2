import mongoose, { Document, Schema } from 'mongoose';

export interface IGoldPrice extends Document {
    date: Date;
    pricePerGram: number; // In INR
    source: string;
}

const GoldPriceSchema = new Schema<IGoldPrice>({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    pricePerGram: {
        type: Number,
        required: true,
        min: 0
    },
    source: {
        type: String,
        default: 'manual'
    }
}, {
    timestamps: true
});

export default mongoose.model<IGoldPrice>('GoldPrice', GoldPriceSchema);
