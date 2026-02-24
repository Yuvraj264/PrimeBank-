import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    accountId: mongoose.Schema.Types.ObjectId;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'bill_payment';
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    senderName?: string;
    receiverName?: string;
    receiverAccountId?: string; // For transfers
    reference?: string; // For bill payments or external refs
    description?: string;
    date: Date;
    category?: 'income' | 'expense' | 'bills' | 'shopping' | 'transfer';
    isFlagged?: boolean;
    riskScore?: number;
}

const TransactionSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'transfer', 'bill_payment'],
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'completed'
    },
    senderName: { type: String },
    receiverName: { type: String },
    receiverAccountId: { type: String },
    reference: { type: String },
    description: { type: String },
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

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
