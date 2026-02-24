import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    require2FA: boolean;
    maxLoginAttempts: number;
    sessionTimeoutMins: number;
    minTransferLimit: number;
    maxTransferLimit: number;
    systemEmail: string;
}

const SystemConfigSchema: Schema = new Schema({
    maintenanceMode: { type: Boolean, default: false },
    allowNewRegistrations: { type: Boolean, default: true },
    require2FA: { type: Boolean, default: false },
    maxLoginAttempts: { type: Number, default: 3 },
    sessionTimeoutMins: { type: Number, default: 30 },
    minTransferLimit: { type: Number, default: 10 },
    maxTransferLimit: { type: Number, default: 50000 },
    systemEmail: { type: String, default: 'admin@primebank.com' }
}, { timestamps: true });

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
