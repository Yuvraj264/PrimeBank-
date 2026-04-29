import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Must be a 32-byte key for AES-256
const ENCRYPTION_KEY = process.env.BIOMETRIC_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);

// AES-256-GCM Settings
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a buffer using AES-256-GCM
 * @param buffer The data to encrypt
 * @returns A base64-encoded string containing iv:authTag:encryptedData
 */
export function encryptBuffer(buffer: Buffer): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Format: base64(iv):base64(authTag):base64(encrypted)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypts a previously encrypted base64 string
 * @param encryptedText The formatted encrypted string (iv:authTag:encryptedData)
 * @returns The decrypted buffer
 */
export function decryptBuffer(encryptedText: string): Buffer {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encryptedData = Buffer.from(parts[2], 'base64');

    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
}

/**
 Hashes a string using SHA-256 (useful for mapping IDs securely without storing raw)
 */
export function hashString(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}
