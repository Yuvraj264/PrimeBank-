import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    accountId: mongoose.Schema.Types.ObjectId;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    type: 'visa' | 'mastercard';
    status: 'active' | 'frozen' | 'blocked';
    createdAt: Date;
}

const CardSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    cardNumber: { type: String, required: true, unique: true },
    cardHolder: { type: String, required: true },
    expiryDate: { type: String, required: true }, // Format: MM/YY
    cvv: { type: String, required: true },
    type: { type: String, enum: ['visa', 'mastercard'], default: 'visa' },
    status: { type: String, enum: ['active', 'frozen', 'blocked'], default: 'active' }
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

export default mongoose.model<ICard>('Card', CardSchema);
