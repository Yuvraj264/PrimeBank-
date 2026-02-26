import mongoose, { Schema, Document } from 'mongoose';

/*
BENEFICIARIES TABLE DESIGN:
id -> Mongoose _id
user_id -> userId
name
bank_name -> bankName
account_number -> accountNumber
ifsc
nickname
daily_limit -> dailyLimit
created_at -> timestamps
*/

export interface IBeneficiary extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    name: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    nickname?: string;
    dailyLimit: number;

    // Legacy fields
    ifscCode?: string;
    swiftCode?: string;
    type?: 'domestic' | 'international';
    avatar?: string;
    isFavorite?: boolean;
}

const BeneficiarySchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String },
    nickname: { type: String },
    dailyLimit: { type: Number, default: 50000 },

    // Legacy fields
    ifscCode: { type: String },
    swiftCode: { type: String },
    type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
    avatar: { type: String },
    isFavorite: { type: Boolean, default: false },

}, { timestamps: true });

BeneficiarySchema.pre('save', async function () {
    const doc = this as any as IBeneficiary;
    if (doc.ifscCode && !doc.ifsc) doc.ifsc = doc.ifscCode;
    if (doc.ifsc && !doc.ifscCode) doc.ifscCode = doc.ifsc;
});

BeneficiarySchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export default mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
