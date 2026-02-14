import mongoose, { Schema, Document } from 'mongoose';

export interface IKYCRequest extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    documentType: 'aadhaar' | 'pan' | 'passport' | 'voter_id';
    documentNumber: string;
    documentUrl: string; // URL or path to the uploaded file
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Schema.Types.ObjectId;
}

const KYCRequestSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'passport', 'voter_id'],
        required: true
    },
    documentNumber: { type: String, required: true },
    documentUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminComment: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IKYCRequest>('KYCRequest', KYCRequestSchema);
