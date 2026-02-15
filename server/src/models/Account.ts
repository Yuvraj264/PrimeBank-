import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    accountNumber: string;
    type: 'savings' | 'current';
    balance: number;
    currency: string;
    status: 'active' | 'frozen' | 'closed';
    dailyLimit: number;
    usedLimit: number;
    lastLimitResetDate: Date;
}

const AccountSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['savings', 'current'], required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['active', 'frozen', 'closed'], default: 'active' },
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

export default mongoose.model<IAccount>('Account', AccountSchema);
