import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
    businessId: mongoose.Types.ObjectId; // References BusinessProfile or User
    name: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    gstNumber?: string;
    isActive: boolean;
}

const VendorSchema: Schema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Using User _id as the primary merchant identifier securely
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },
    bankName: { type: String, required: true },
    gstNumber: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IVendor>('Vendor', VendorSchema);
