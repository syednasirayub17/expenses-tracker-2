import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags?: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

journalSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IJournalEntry>('Journal', journalSchema);
