import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'employee' | 'customer';
    phone: string;
    status: 'active' | 'blocked' | 'pending';
    twoFactorEnabled: boolean;
    profileCompleted: boolean;
    avatar?: string;
    lastLogin?: Date;
    personalDetails?: {
        fullName: string;
        dob: string;
        gender: string;
        maritalStatus: string;
        fatherName: string;
    };
    identityDetails?: {
        panNumber: string;
        aadhaarNumber: string;
    };
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    professionalDetails?: {
        occupation: string;
        incomeSource: string;
        annualIncome: number;
    };
    nominee?: {
        name: string;
        relation: string;
        dob: string;
    };
    matchPassword(enteredPassword: string): Promise<boolean>;
    _id: mongoose.Types.ObjectId;
    id: string;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee', 'customer'], default: 'customer' },
    phone: { type: String, required: true },
    status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'active' },
    twoFactorEnabled: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    avatar: { type: String },
    lastLogin: { type: Date },
    personalDetails: {
        fullName: String,
        dob: String,
        gender: String,
        maritalStatus: String,
        fatherName: String,
    },
    identityDetails: {
        panNumber: String,
        aadhaarNumber: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    professionalDetails: {
        occupation: String,
        incomeSource: String,
        annualIncome: Number,
    },
    nominee: {
        name: String,
        relation: String,
        dob: String,
    },
}, { timestamps: true });

UserSchema.pre('save', async function () {
    const user = this as any as IUser;
    if (!user.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password!, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
