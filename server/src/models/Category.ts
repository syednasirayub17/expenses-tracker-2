import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
    userId: mongoose.Types.ObjectId
    expense: string[]
    income: string[]
    payment: string[]
    createdAt: Date
    updatedAt: Date
}

const CategorySchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One category document per user
        },
        expense: {
            type: [String],
            default: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
        },
        income: {
            type: [String],
            default: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
        },
        payment: {
            type: [String],
            default: ['Credit Card Payment', 'Loan EMI', 'Other'],
        },
    },
    {
        timestamps: true,
    }
)

// Index for faster queries
CategorySchema.index({ userId: 1 })

export default mongoose.model<ICategory>('Category', CategorySchema)
