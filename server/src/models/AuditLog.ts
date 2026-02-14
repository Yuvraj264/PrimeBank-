import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: mongoose.Schema.Types.ObjectId;
    action: string;
    targetId?: mongoose.Schema.Types.ObjectId;
    targetModel?: string;
    details?: string;
    ipAddress?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetModel: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
