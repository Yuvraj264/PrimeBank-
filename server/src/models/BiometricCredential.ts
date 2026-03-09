import mongoose, { Schema, Document } from 'mongoose';
import { biometricDb } from '../config/biometricDb';
import { encryptBuffer, decryptBuffer } from '../utils/cryptoUtils';

export interface IBiometricCredential extends Document {
    userId: string; // Stored as a plain string or standard reference, since we need to match it. Can be hashed if strictly purely isolated, but usually is an FK.
    credentialID: Buffer;      // Used for WebAuthn authentication (not the hash, but original so we can query it)
    credentialPublicKey: string; // The encrypted public key payload
    counter: number;           // Sign count to prevent Replay attacks
    deviceType: 'singleDevice' | 'multiDevice';
    backedUp: boolean;
    transports?: string[];
    createdAt: Date;

    getDecryptedPublicKey(): Buffer;
    setDecryptedPublicKey(buffer: Buffer): void;
}

const BiometricCredentialSchema: Schema = new Schema({
    // Keep userId clear so we can easily delete/find credentials for a user.
    userId: { type: String, required: true, index: true },

    // In @simplewebauthn, credentialID is a Uint8Array; we store as binary. We can index it to find creds on login.
    credentialID: { type: Buffer, required: true, unique: true },

    // The encrypted AES-256 string
    credentialPublicKey: { type: String, required: true },

    counter: { type: Number, required: true, default: 0 },

    deviceType: { type: String, required: true, enum: ['singleDevice', 'multiDevice'] },
    backedUp: { type: Boolean, required: true, default: false },
    transports: [{ type: String }],
}, { timestamps: true });

// Methods to handle encryption dynamically, using our crypto utils
BiometricCredentialSchema.methods.setDecryptedPublicKey = function (buffer: Buffer) {
    this.credentialPublicKey = encryptBuffer(buffer);
};

BiometricCredentialSchema.methods.getDecryptedPublicKey = function (): Buffer {
    return decryptBuffer(this.credentialPublicKey);
};

// Mount model onto the isolated connection
export default biometricDb.model<IBiometricCredential>('BiometricCredential', BiometricCredentialSchema);
