import mongoose, { Schema, Document } from 'mongoose';

export interface IBeneficiary extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    name: string;
    accountNumber: string;
    bankName: string;
    ifscCode?: string; // International/Domestic code
    swiftCode?: string;
    type: 'domestic' | 'international';
    avatar?: string;
    nickname?: string;
}

const BeneficiarySchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String },
    swiftCode: { type: String },
    type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
    avatar: { type: String },
    nickname: { type: String }
}, { timestamps: true });

// Prevent duplicate beneficiaries for the same user with the same account number
BeneficiarySchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export default mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
