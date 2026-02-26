import mongoose, { Schema, Document } from 'mongoose';

/*
TRANSACTIONS TABLE DESIGN:
id -> Mongoose _id
from_account_id -> fromAccountId
to_account_id -> toAccountId
amount
transaction_type (debit/credit) -> transactionType
method (upi/neft/internal/card) -> method
status (pending/completed/failed) -> status
description
reference_id -> referenceId
created_at -> timestamps
*/

export interface ITransaction extends Document {
    fromAccountId?: mongoose.Schema.Types.ObjectId;
    toAccountId?: mongoose.Schema.Types.ObjectId;
    amount: number;
    transactionType: 'debit' | 'credit';
    method: 'upi' | 'neft' | 'internal' | 'card';
    status: 'pending' | 'completed' | 'failed';
    description?: string;
    referenceId?: string;
    scheduledDate?: Date;
    processingDelay?: number; // Represented in milliseconds or minutes. Let's say hours.

    // Legacy fields for existing controllers
    userId?: mongoose.Schema.Types.ObjectId;
    accountId?: mongoose.Schema.Types.ObjectId;
    type?: 'deposit' | 'withdrawal' | 'transfer' | 'bill_payment';
    currency?: string;
    senderName?: string;
    receiverName?: string;
    receiverAccountId?: string;
    reference?: string;
    date?: Date;
    category?: 'income' | 'expense' | 'bills' | 'shopping' | 'transfer';
    isFlagged?: boolean;
    riskScore?: number;
}

const TransactionSchema: Schema = new Schema({
    fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ['debit', 'credit'], required: true, default: 'debit' },
    method: { type: String, enum: ['upi', 'neft', 'internal', 'card'], required: true, default: 'internal' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    description: { type: String },
    referenceId: { type: String },
    scheduledDate: { type: Date },
    processingDelay: { type: Number },

    // Legacy fields
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'bill_payment'] },
    currency: { type: String, default: 'USD' },
    senderName: { type: String },
    receiverName: { type: String },
    receiverAccountId: { type: String },
    reference: { type: String },
    date: { type: Date, default: Date.now },
    category: { type: String, enum: ['income', 'expense', 'bills', 'shopping', 'transfer'] },
    isFlagged: { type: Boolean, default: false },
    riskScore: { type: Number, default: 0 }
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

// Map legacy fields before saving
TransactionSchema.pre('save', async function () {
    const doc = this as any as ITransaction;
    if (doc.type === 'deposit') {
        doc.transactionType = 'credit';
        doc.toAccountId = doc.accountId;
    } else if (doc.type === 'withdrawal' || doc.type === 'bill_payment') {
        doc.transactionType = 'debit';
        doc.fromAccountId = doc.accountId;
    }

    if (doc.reference && !doc.referenceId) {
        doc.referenceId = doc.reference;
    }

    if (!doc.date) {
        doc.date = new Date();
    }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
