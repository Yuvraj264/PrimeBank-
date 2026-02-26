import mongoose, { Schema, Document } from 'mongoose';

export interface ISanctionList extends Document {
    name: string;
    country?: string;
    reason: string;
    listedAt: Date;
}

const SanctionListSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    country: { type: String },
    reason: { type: String, required: true },
    listedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Case-insensitive index for fast searching
SanctionListSchema.index({ name: 'text' });

export default mongoose.model<ISanctionList>('SanctionList', SanctionListSchema);
