import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklistedIP extends Document {
    ip: string;
    reason: string;
    addedBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const BlacklistedIPSchema: Schema = new Schema({
    ip: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IBlacklistedIP>('BlacklistedIP', BlacklistedIPSchema);
