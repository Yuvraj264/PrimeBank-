import mongoose, { Schema, Document } from 'mongoose';

/*
INVESTMENTS TABLE DESIGN:
id
user_id
investment_type (FD/RD/MF)
amount
returns_percentage
maturity_date
status
created_at
*/

export interface IInvestment extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    investmentType: 'FD' | 'RD' | 'MF';
    amount: number;
    returnsPercentage: number;
    maturityDate: Date;
    status: 'active' | 'matured' | 'closed';
    createdAt: Date;
}

const InvestmentSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    investmentType: { type: String, enum: ['FD', 'RD', 'MF'], required: true },
    amount: { type: Number, required: true },
    returnsPercentage: { type: Number, required: true },
    maturityDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'matured', 'closed'], default: 'active' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc: any, ret: any) {
            delete ret._id;
        }
    }
});

export default mongoose.model<IInvestment>('Investment', InvestmentSchema);
