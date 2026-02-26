import mongoose, { Schema, Document } from 'mongoose';

/*
SUPPORT_TICKETS TABLE DESIGN:
id
user_id
subject
category
description
status (open/resolved/pending)
priority
created_at
*/

export interface ISupportTicket extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    subject: string;
    category: string;
    description: string;
    status: 'open' | 'resolved' | 'pending';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
}

const SupportTicketSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'pending'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
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

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
