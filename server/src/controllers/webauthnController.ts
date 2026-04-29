import { Request, Response, NextFunction } from 'express';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import BiometricCredential from '../models/BiometricCredential';
import User from '../models/User';
import { authService } from '../services/AuthService';
import { auditService } from '../services/AuditService';
import WebAuthnChallenge from '../models/WebAuthnChallenge';
import fs from 'fs';

const logDebug = (msg: string) => {
    try {
        fs.appendFileSync('webauthn_debug.txt', `${new Date().toISOString()} - ${msg}\n`);
    } catch (e) { }
};

// Rely on environment variables or defaults for RP (Relying Party) info
const rpName = 'iBank';
const rpID = process.env.RP_ID || 'localhost';
const expectedRPID = ['localhost', '127.0.0.1', rpID];
const expectedOrigin = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.VITE_WEB_URL || 'http://localhost:8080'
];

export const generateRegistrationChallenge = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
        return next(new AppError('User not authenticated', 401));
    }

    const { id: userId, email, fullName } = user;

    const userCredentials = await BiometricCredential.find({ userId });

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: Buffer.from(userId, 'utf-8'),
        userName: email,
        userDisplayName: fullName || email,
        attestationType: 'none',
        excludeCredentials: userCredentials.map(cred => ({
            id: cred.credentialID.toString('base64url'),
            type: 'public-key',
            transports: cred.transports as any,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Typically platform for device biometrics
        },
    });

    // Store challenge temporarily (e.g., 5 mins TTL) in MongoDB
    await WebAuthnChallenge.findOneAndUpdate(
        { challengeKey: `reg:${userId}` },
        { challenge: options.challenge },
        { upsert: true, new: true }
    );

    res.status(200).json({ status: 'success', data: options });
});

export const verifyRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const body = req.body;

    const challengeDoc = await WebAuthnChallenge.findOne({ challengeKey: `reg:${user.id}` });
    if (!challengeDoc) {
        return next(new AppError('Challenge expired or missing', 400));
    }
    const expectedChallenge = challengeDoc.challenge;

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            requireUserVerification: false,
        });
    } catch (error: any) {
        return next(new AppError(error.message, 400));
    }

    if (verification.verified && verification.registrationInfo) {
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

        const newCredential = new BiometricCredential({
            userId: String(user.id),
            credentialID: Buffer.from(credential.id, 'base64url'), // storing as Buffer
            counter: credential.counter,
            deviceType: credentialDeviceType || 'singleDevice',
            backedUp: credentialBackedUp || false,
            transports: credential.transports || [],
        });

        // Use our utility to safely encrypt public key
        newCredential.setDecryptedPublicKey(Buffer.from(credential.publicKey));

        await newCredential.save();
        await WebAuthnChallenge.deleteOne({ challengeKey: `reg:${user.id}` });

        return res.status(200).json({ status: 'success', message: 'Device registered successfully' });
    }

    res.status(400).json({ status: 'fail', message: 'Verification failed' });
});

export const generateLoginChallenge = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Please provide your email to login with biometrics', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const userCredentials = await BiometricCredential.find({ userId: String(user._id) });
    if (!userCredentials.length) {
        return next(new AppError('No biometric credentials registered for this user.', 404));
    }

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userCredentials.map(cred => ({
            id: cred.credentialID.toString('base64url'),
            type: 'public-key',
            transports: cred.transports as any,
        })),
        userVerification: 'preferred',
    });

    const challengeId = Math.random().toString(36).substr(2, 9);
    await WebAuthnChallenge.findOneAndUpdate(
        { challengeKey: `auth:${challengeId}` },
        { challenge: options.challenge },
        { upsert: true, new: true }
    );

    res.status(200).json({ status: 'success', data: { options, challengeId } });
});

export const verifyLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { body, challengeId } = req.body;
    logDebug(`[verifyLogin] Started. challengeId=${challengeId}, body.id=${body?.id}`);

    if (!challengeId || !body || !body.id) {
        logDebug(`[verifyLogin] Error: Missing validation parameters`);
        return next(new AppError('Missing validation parameters', 400));
    }

    const challengeDoc = await WebAuthnChallenge.findOne({ challengeKey: `auth:${challengeId}` });
    if (!challengeDoc) {
        logDebug(`[verifyLogin] Error: Challenge missing in DB for key auth:${challengeId}`);
        return next(new AppError('Challenge expired or missing', 400));
    }
    const expectedChallenge = challengeDoc.challenge;
    logDebug(`[verifyLogin] Found expectedChallenge: ${expectedChallenge}`);

    // Look up the credential in our database
    // The SimpleWebAuthn browser client returns base64url encoded credential ID in `body.id`
    const credentialIdBuffer = Buffer.from(body.id, 'base64url');
    logDebug(`[verifyLogin] Parsed credentialIdBuffer from body.id. Length: ${credentialIdBuffer.length}`);

    const credential = await BiometricCredential.findOne({ credentialID: credentialIdBuffer });
    if (!credential) {
        logDebug(`[verifyLogin] Error: Credential not found in DB`);
        return next(new AppError('Credential not found. Please register your device first.', 404));
    }
    logDebug(`[verifyLogin] Found credential. UserID: ${credential.userId}`);

    const user = await User.findById(credential.userId);
    if (!user) {
        logDebug(`[verifyLogin] Error: User not found`);
        return next(new AppError('User not found', 404));
    }
    logDebug(`[verifyLogin] Calling verifyAuthenticationResponse...`);

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            requireUserVerification: false,
            credential: {
                id: credential.credentialID.toString('base64url'),
                publicKey: new Uint8Array(credential.getDecryptedPublicKey()),
                counter: credential.counter,
                transports: credential.transports as any,
            },
        });
        logDebug(`[verifyLogin] verification outcome: ${JSON.stringify(verification)}`);
    } catch (error: any) {
        logDebug(`[verifyLogin] Exception thrown: ${error.message}`);
        return next(new AppError(`Verification Exception: ${error.message}`, 400));
    }

    if (verification.verified && verification.authenticationInfo) {
        // Update the counter to prevent replay attacks
        credential.counter = verification.authenticationInfo.newCounter;
        await credential.save();

        // Perform login action
        await WebAuthnChallenge.deleteOne({ challengeKey: `auth:${challengeId}` });
        await auditService.logLogin(String(user._id), req.ip || 'unknown');

        // Generate tokens using authService
        const { accessToken, refreshToken } = await authService.generateTokensForUser(user);

        // Send refresh token as cookie (matching authController behavior)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            status: 'success',
            token: accessToken,
            user: { _id: user._id, email: user.email, role: user.role, name: user.name },
            message: 'Biometric verification successful'
        });
    }

    logDebug(`[verifyLogin] Failure: verification.verified = false`);
    res.status(400).json({ status: 'fail', message: 'Verification failed' });
});
