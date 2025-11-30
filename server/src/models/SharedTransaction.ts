import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedTransaction extends Document {
    walletId: mongoose.Types.ObjectId;
    title: string;
    amount: number;
    category: string;
    type: 'expense' | 'income' | 'settlement';
    paidBy: mongoose.Types.ObjectId;
    splitType: 'equal' | 'custom' | 'percentage';
    splits: Array<{
        userId: mongoose.Types.ObjectId;
        amount: number;
        paid: boolean;
    }>;
    date: Date;
    receipt?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SharedTransactionSchema = new Schema<ISharedTransaction>(
    {
        walletId: {
            type: Schema.Types.ObjectId,
            ref: 'SharedWallet',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['expense', 'income', 'settlement'],
            required: true
        },
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        splitType: {
            type: String,
            enum: ['equal', 'custom', 'percentage'],
            default: 'equal'
        },
        splits: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            paid: {
                type: Boolean,
                default: false
            }
        }],
        date: {
            type: Date,
            required: true
        },
        receipt: {
            type: String
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model<ISharedTransaction>('SharedTransaction', SharedTransactionSchema);
