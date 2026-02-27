import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessProfile extends Document {
    userId: mongoose.Types.ObjectId;
    businessName: string;
    gstNumber: string;
    pan: string;
    businessType: 'sole_proprietorship' | 'partnership' | 'llp' | 'private_limited' | 'public_limited' | 'ngo';
    turnover: number;
    // API Banking
    apiKey?: string;
    apiSecretHash?: string;
    webhookUrl?: string;
    apiRateLimit: number;
    isActive: boolean;
}

const BusinessProfileSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true },
    gstNumber: { type: String, required: true, unique: true },
    pan: { type: String, required: true, unique: true },
    businessType: {
        type: String,
        enum: ['sole_proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'ngo'],
        required: true
    },
    turnover: { type: Number, required: true, default: 0 },
    // Advanced APi Features
    apiKey: { type: String, unique: true, sparse: true },
    apiSecretHash: { type: String },
    webhookUrl: { type: String },
    apiRateLimit: { type: Number, default: 100 }, // Requests per minute
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IBusinessProfile>('BusinessProfile', BusinessProfileSchema);
