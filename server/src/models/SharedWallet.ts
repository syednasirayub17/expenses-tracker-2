import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedWallet extends Document {
    name: string;
    description?: string;
    type: 'family' | 'friends' | 'trip' | 'other';
    createdBy: mongoose.Types.ObjectId;
    members: Array<{
        userId: mongoose.Types.ObjectId;
        role: 'admin' | 'member';
        joinedAt: Date;
    }>;
    balance: number;
    currency: string;
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
}

const SharedWalletSchema = new Schema<ISharedWallet>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            enum: ['family', 'friends', 'trip', 'other'],
            required: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['admin', 'member'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
        balance: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        inviteCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        }
    },
    { timestamps: true }
);

// Index for finding user's wallets
SharedWalletSchema.index({ 'members.userId': 1 });

export default mongoose.model<ISharedWallet>('SharedWallet', SharedWalletSchema);
