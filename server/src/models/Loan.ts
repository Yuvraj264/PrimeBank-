import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: 'personal' | 'home' | 'education' | 'car';
    amount: number;
    tenure: number; // in months
    interestRate: number;
    status: 'pending' | 'approved' | 'rejected';
    creditScore: number;
    monthlyIncome: number;
    employmentStatus: string;
    adminComment?: string;
    approvedBy?: mongoose.Schema.Types.ObjectId;
    approvedAt?: Date;
    appliedAt: Date;
}

const LoanSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['personal', 'home', 'education', 'car'],
        required: true
    },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    creditScore: { type: Number },
    monthlyIncome: { type: Number },
    employmentStatus: { type: String },
    adminComment: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ILoan>('Loan', LoanSchema);
