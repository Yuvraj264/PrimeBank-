import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/*
USERS TABLE DESIGN:
id (UUID) -> Mongoose _id
full_name -> fullName
email (unique)
phone (unique)
password_hash -> password (hashed via pre-save hook)
role (customer/admin)
is_verified -> isVerified
kyc_status (pending/approved/rejected) -> kycStatus
account_status (active/frozen/closed) -> accountStatus
created_at -> timestamps
updated_at -> timestamps
*/

export interface IUser extends Document {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    transactionPin?: string;
    role: 'customer' | 'admin' | 'employee'; // keeping employee from old schema just in case
    isVerified: boolean;
    kycStatus: 'pending' | 'approved' | 'rejected';
    accountStatus: 'active' | 'frozen' | 'closed';
    refreshToken?: string;

    // Legacy fields that might still be needed by existing controllers temporarily during transition
    name?: string;
    status?: 'active' | 'blocked' | 'pending';

    matchPassword(enteredPassword: string): Promise<boolean>;
    matchTransactionPin(enteredPin: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    transactionPin: { type: String },
    role: { type: String, enum: ['customer', 'admin', 'employee'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    accountStatus: { type: String, enum: ['active', 'frozen', 'closed'], default: 'active' },
    refreshToken: { type: String },

    // Legacy mapping (virtual or actual fields kept for a smooth transition before controller rewrites)
    name: { type: String },
    status: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function () {
    const user = this as any as IUser;

    // Auto-sync legacy fields
    if (user.fullName && !user.name) user.name = user.fullName;
    if (user.name && !user.fullName) user.fullName = user.name;

    if (user.accountStatus && !user.status) {
        user.status = user.accountStatus === 'frozen' ? 'blocked' : user.accountStatus as any;
    }

    if (user.isModified('transactionPin') && user.transactionPin) {
        const saltPin = await bcrypt.genSalt(10);
        user.transactionPin = await bcrypt.hash(user.transactionPin, saltPin);
    }

    if (!user.isModified('password') || !user.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.matchTransactionPin = async function (enteredPin: string) {
    if (!this.transactionPin) return false;
    return await bcrypt.compare(enteredPin, this.transactionPin);
};

export default mongoose.model<IUser>('User', UserSchema);
