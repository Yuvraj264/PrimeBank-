import mongoose, { Schema, Document } from 'mongoose';

/*
NOTIFICATIONS TABLE DESIGN:
id
user_id
type
message
is_read
created_at
*/

export interface INotification extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
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

export default mongoose.model<INotification>('Notification', NotificationSchema);
