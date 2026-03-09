import mongoose, { Document, Schema } from 'mongoose';

export interface IWebAuthnChallenge extends Document {
    challengeKey: string;
    challenge: string;
    createdAt: Date;
}

const webAuthnChallengeSchema = new Schema<IWebAuthnChallenge>({
    challengeKey: { type: String, required: true, unique: true },
    challenge: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // TTL 5 minutes
});

const WebAuthnChallenge = mongoose.model<IWebAuthnChallenge>('WebAuthnChallenge', webAuthnChallengeSchema);

export default WebAuthnChallenge;
