import mongoose, { Schema, Document } from 'mongoose';

/*
BILLS TABLE DESIGN:
id
user_id
bill_type
biller_name
account_number
due_date
amount
status
auto_pay_enabled
created_at
*/

export interface IBill extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    billType: string;
    billerName: string;
    accountNumber: string;
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    autoPayEnabled: boolean;
    createdAt: Date;
}

const BillSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    billType: { type: String, required: true },
    billerName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    autoPayEnabled: { type: Boolean, default: false }
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

export default mongoose.model<IBill>('Bill', BillSchema);
