import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'transaction_add' | 'transaction_delete' | 'transaction_update' | 'account_add' | 'account_delete' | '2fa_enabled' | '2fa_disabled';
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    location?: {
        city?: string;
        region?: string;
        country?: string;
    };
    success: boolean;
    metadata?: any;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'failed_login', 'password_change', 'transaction_add', 'transaction_delete', 'transaction_update', 'account_add', 'account_delete', '2fa_enabled', '2fa_disabled']
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    browser: {
        type: String,
        required: true
    },
    location: {
        city: String,
        region: String,
        country: String
    },
    success: {
        type: Boolean,
        default: true
    },
    metadata: Schema.Types.Mixed
});

// Index for efficient querying
ActivityLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
