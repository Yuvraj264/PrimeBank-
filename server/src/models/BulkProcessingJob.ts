import mongoose, { Schema, Document } from 'mongoose';

export interface IBulkProcessingJob extends Document {
    userId: mongoose.Types.ObjectId;
    jobType: 'payroll' | 'vendor_payout' | 'general_bulk';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    totalAmount: number;
    tdsDeducted?: number; // Total simulated TDS explicitly calculated via the payroll pipeline
    uploadFileName: string;
    reportUrl?: string; // Location of the output summary (e.g., S3 URL or JSON blob proxy)
    errorMessage?: string; // If the entire batch failed pre-flight
}

const BulkProcessingJobSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobType: { type: String, enum: ['payroll', 'vendor_payout', 'general_bulk'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    totalRecords: { type: Number, required: true, default: 0 },
    successfulRecords: { type: Number, default: 0 },
    failedRecords: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    tdsDeducted: { type: Number, default: 0 },
    uploadFileName: { type: String, required: true },
    reportUrl: { type: String },
    errorMessage: { type: String }
}, { timestamps: true });

export default mongoose.model<IBulkProcessingJob>('BulkProcessingJob', BulkProcessingJobSchema);
