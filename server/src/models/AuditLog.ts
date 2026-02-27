import mongoose, { Schema, Document } from 'mongoose';
import { AppError } from '../utils/appError';

export interface IAuditLog extends Document {
    userId?: mongoose.Types.ObjectId;
    ipAddress?: string;
    action: string;
    entityType: string;
    entityId?: string | mongoose.Types.ObjectId;
    beforeState?: any;
    afterState?: any;
    severity?: 'info' | 'warning' | 'destructive' | 'security';
    details?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.Mixed }, // String or ObjectId depending on the entity
    beforeState: { type: Schema.Types.Mixed }, // JSON snapshot
    afterState: { type: Schema.Types.Mixed }, // JSON snapshot
    severity: { type: String, enum: ['info', 'warning', 'destructive', 'security'], default: 'info' },
    details: { type: String },
    timestamp: { type: Date, default: Date.now, immutable: true }
});

// Enforce Database Immutability for Regulatory Compliance
const IMMUTABLE_METHODS = [
    'updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace',
    'deleteOne', 'deleteMany', 'findOneAndDelete', 'remove'
];

IMMUTABLE_METHODS.forEach(method => {
    AuditLogSchema.pre(method as any, function (next: mongoose.CallbackWithoutResultAndOptionalError) {
        next(new AppError('Audit logs are immutable and strictly append-only. Modification or deletion is forbidden by compliance.', 403));
    });
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
