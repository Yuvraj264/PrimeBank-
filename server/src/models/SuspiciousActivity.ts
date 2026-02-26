import mongoose, { Schema, Document } from 'mongoose';

export interface ISuspiciousActivity extends Document {
    userId: mongoose.Types.ObjectId;
    transactionId?: mongoose.Types.ObjectId;
    ruleFlagged: 'large_transaction' | 'velocity_check' | 'structuring' | 'sanction_match' | 'high_risk_country';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending_review' | 'approved' | 'rejected' | 'blocked';
    adminRemarks?: string;
    metadata?: any;
}

const SuspiciousActivitySchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    ruleFlagged: {
        type: String,
        enum: ['large_transaction', 'velocity_check', 'structuring', 'sanction_match', 'high_risk_country'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending_review', 'approved', 'rejected', 'blocked'],
        default: 'pending_review'
    },
    adminRemarks: { type: String },
    metadata: { type: Schema.Types.Mixed }, // E.g., caching the flagged amount, frequency count, matched sanction name
}, { timestamps: true });

export default mongoose.model<ISuspiciousActivity>('SuspiciousActivity', SuspiciousActivitySchema);
