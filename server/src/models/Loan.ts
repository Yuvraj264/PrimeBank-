import mongoose, { Schema, Document } from 'mongoose';

/*
LOANS TABLE DESIGN:
id -> Mongoose _id
user_id -> userId
loan_type -> loanType
principal_amount -> principalAmount
interest_rate -> interestRate
tenure_months -> tenureMonths
emi_amount -> emiAmount
remaining_balance -> remainingBalance
status -> status (pending/approved/rejected)
emi_schedule -> emiSchedule (Array of monthly breakdown)
collateral -> collateral (Asset tracking)
risk_profile -> riskProfile (ML output payload)
created_at -> timestamps
*/

export interface IEMISchedule {
    month: number;
    principalComponent: number;
    interestComponent: number;
    remainingBalance: number;
}

export interface ICollateral {
    assetType: string;
    assetValue: number;
    ltvRatio: number;
    valuationDate: Date;
}

export interface IRiskProfile {
    approvalProbability: number;
    maxLoanLimit: number;
    riskScore: number;
}


export interface ILoan extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    loanType: 'personal' | 'home' | 'education' | 'car';
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    emiAmount: number;
    remainingBalance: number;
    status: 'pending' | 'approved' | 'rejected';
    emiSchedule?: IEMISchedule[];
    collateral?: ICollateral;
    riskProfile?: IRiskProfile;

    // Legacy fields
    type?: string;
    amount?: number;
    tenure?: number;
    creditScore?: number;
    monthlyIncome?: number;
    employmentStatus?: string;
    adminComment?: string;
    approvedBy?: mongoose.Schema.Types.ObjectId;
    approvedAt?: Date;
    appliedAt?: Date;
}

const LoanSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanType: {
        type: String,
        enum: ['personal', 'home', 'education', 'car'],
        required: true,
        default: 'personal'
    },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    emiAmount: { type: Number, required: true, default: 0 },
    remainingBalance: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    emiSchedule: [{
        month: { type: Number },
        principalComponent: { type: Number },
        interestComponent: { type: Number },
        remainingBalance: { type: Number }
    }],
    collateral: {
        assetType: { type: String },
        assetValue: { type: Number },
        ltvRatio: { type: Number },
        valuationDate: { type: Date }
    },
    riskProfile: {
        approvalProbability: { type: Number },
        maxLoanLimit: { type: Number },
        riskScore: { type: Number }
    },

    // Legacy fields
    type: { type: String, enum: ['personal', 'home', 'education', 'car'] },
    amount: { type: Number },
    tenure: { type: Number },
    creditScore: { type: Number },
    monthlyIncome: { type: Number },
    employmentStatus: { type: String },
    adminComment: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

LoanSchema.pre('validate', async function () {
    const doc = this as any as ILoan;
    if (doc.type && !doc.loanType) doc.loanType = doc.type as any;
    if (doc.loanType && !doc.type) doc.type = doc.loanType;

    if (doc.amount && !doc.principalAmount) {
        doc.principalAmount = doc.amount;
        doc.remainingBalance = doc.amount; // default initialization
    }

    if (doc.tenure && !doc.tenureMonths) doc.tenureMonths = doc.tenure;
});

LoanSchema.pre('save', async function () {
});

export default mongoose.model<ILoan>('Loan', LoanSchema);
