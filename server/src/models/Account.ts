import mongoose, { Schema, Document } from 'mongoose';

/*
ACCOUNTS TABLE DESIGN:
id -> Mongoose _id
user_id (FK) -> userId
account_number (unique) -> accountNumber
account_type (savings/current) -> accountType
balance
ledger_balance -> ledgerBalance
currency
branch
ifsc
is_active -> isActive
created_at -> timestamps
*/

export interface IAccount extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    accountNumber: string;
    accountType: 'savings' | 'current';
    balance: number;
    ledgerBalance: number;
    currency: string;
    branch: string;
    ifsc: string;
    isActive: boolean;

    // Legacy fields
    type?: string;
    status?: string;
    dailyLimit?: number;
    usedLimit?: number;
    lastLimitResetDate?: Date;
}

const AccountSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true, unique: true },
    accountType: { type: String, enum: ['savings', 'current'], required: true, default: 'savings' },
    balance: { type: Number, default: 0 },
    ledgerBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    branch: { type: String, default: 'Main' },
    ifsc: { type: String, default: 'PRMB0001234' },
    isActive: { type: Boolean, default: true },

    // Legacy fields mapping
    type: { type: String, enum: ['savings', 'current'] },
    status: { type: String, enum: ['active', 'frozen', 'closed'] },
    dailyLimit: { type: Number, default: 50000 },
    usedLimit: { type: Number, default: 0 },
    lastLimitResetDate: { type: Date, default: Date.now }
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

AccountSchema.pre('save', async function () {
    const doc = this as any as IAccount;
    if (doc.accountType && !doc.type) doc.type = doc.accountType;
    if (doc.type && !doc.accountType) doc.accountType = doc.type as any;

    if (doc.isActive !== undefined && !doc.status) {
        doc.status = doc.isActive ? 'active' : 'closed';
    }
});

export default mongoose.model<IAccount>('Account', AccountSchema);
