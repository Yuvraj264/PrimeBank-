import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IApiKey extends Document {
    api_key: string;
    api_secret: string; // Stored hashed
    merchant_id: mongoose.Types.ObjectId;
    rate_limit: number;
    is_active: boolean;
    compareSecret(enteredSecret: string): Promise<boolean>;
}

const ApiKeySchema: Schema = new Schema({
    api_key: { type: String, required: true, unique: true, index: true },
    api_secret: { type: String, required: true },
    merchant_id: { type: Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
    rate_limit: { type: Number, default: 100 },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

ApiKeySchema.pre('save', async function () {
    const doc = this as any;
    if (!doc.isModified('api_secret') || !doc.api_secret) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    doc.api_secret = await bcrypt.hash(doc.api_secret as string, salt);
});

ApiKeySchema.methods.compareSecret = async function (enteredSecret: string) {
    if (!this.api_secret) return false;
    return await bcrypt.compare(enteredSecret, this.api_secret);
};

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
