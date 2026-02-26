import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto';

function setEncrypt(value: string) {
    if (!value || value.includes(':')) return value;
    return encrypt(value);
}

function getDecrypt(value: string) {
    if (!value || !value.includes(':')) return value;
    try {
        return decrypt(value);
    } catch (err) {
        return value;
    }
}

/*
CARDS TABLE DESIGN:
id -> Mongoose _id
account_id -> accountId
card_number (encrypted) -> cardNumber
card_type (debit/credit) -> cardType
expiry
cvv (encrypted) -> cvv
is_frozen -> isFrozen
daily_limit -> dailyLimit
online_limit -> onlineLimit
atm_limit -> atmLimit
international_enabled -> internationalEnabled
created_at -> timestamps
*/

export interface ICard extends Document {
    accountId: mongoose.Schema.Types.ObjectId;
    cardNumber: string; // assumed pre-encrypted or hashed where applicable
    cardType: 'debit' | 'credit';
    expiry: string;
    cvv: string; // assumed pre-encrypted
    isFrozen: boolean;
    dailyLimit: number;
    onlineLimit: number;
    atmLimit: number;
    internationalEnabled: boolean;

    // Legacy fields
    userId?: mongoose.Schema.Types.ObjectId;
    cardHolder?: string;
    expiryDate?: string;
    type?: 'visa' | 'mastercard';
    status?: 'active' | 'frozen' | 'blocked';
}

const CardSchema: Schema = new Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    cardNumber: { type: String, required: true, unique: true, set: setEncrypt, get: getDecrypt },
    cardType: { type: String, enum: ['debit', 'credit'], required: true, default: 'debit' },
    expiry: { type: String, required: true }, // Format: MM/YY
    cvv: { type: String, required: true, set: setEncrypt, get: getDecrypt },
    isFrozen: { type: Boolean, default: false },
    dailyLimit: { type: Number, default: 100000 },
    onlineLimit: { type: Number, default: 50000 },
    atmLimit: { type: Number, default: 20000 },
    internationalEnabled: { type: Boolean, default: false },

    // Legacy
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cardHolder: { type: String },
    expiryDate: { type: String },
    type: { type: String, enum: ['visa', 'mastercard'], default: 'visa' },
    status: { type: String, enum: ['active', 'frozen', 'blocked'], default: 'active' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        getters: true,
        transform: function (doc: any, ret: any) {
            delete ret._id;
        }
    }
});

CardSchema.pre('save', async function () {
    const doc = this as any as ICard;
    if (doc.expiryDate && !doc.expiry) doc.expiry = doc.expiryDate;
    if (doc.expiry && !doc.expiryDate) doc.expiryDate = doc.expiry;

    if (doc.status === 'frozen') doc.isFrozen = true;
    if (doc.isFrozen) doc.status = 'frozen';
});

export default mongoose.model<ICard>('Card', CardSchema);
