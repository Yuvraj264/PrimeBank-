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

// Rely on environment variables or defaults for RP (Relying Party) info
const rpName = 'iBank';
const rpID = process.env.RP_ID || 'localhost';
const expectedOrigin = process.env.VITE_WEB_URL || 'http://localhost:8080';

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
            expectedRPID: rpID,
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
    console.log('[verifyLogin] body:', body, 'challengeId:', challengeId);

    if (!challengeId || !body || !body.id) {
        console.log('[verifyLogin] Error: Missing validation parameters');
        return next(new AppError('Missing validation parameters', 400));
    }

    const challengeDoc = await WebAuthnChallenge.findOne({ challengeKey: `auth:${challengeId}` });
    if (!challengeDoc) {
        console.log('[verifyLogin] Error: Challenge expired or missing for key:', `auth:${challengeId}`);
        return next(new AppError('Challenge expired or missing', 400));
    }
    const expectedChallenge = challengeDoc.challenge;

    // Look up the credential in our database
    // The SimpleWebAuthn browser client returns base64url encoded credential ID in `body.id`
    const credentialIdBuffer = Buffer.from(body.rawId, 'base64url');
    console.log('[verifyLogin] Looking for credential with ID length:', credentialIdBuffer.length);

    const credential = await BiometricCredential.findOne({ credentialID: credentialIdBuffer });
    if (!credential) {
        console.log('[verifyLogin] Error: Credential not found');
        return next(new AppError('Credential not found. Please register your device first.', 404));
    }

    const user = await User.findById(credential.userId);
    if (!user) {
        console.log('[verifyLogin] Error: User not found');
        return next(new AppError('User not found', 404));
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpID,
            credential: {
                id: credential.credentialID.toString('base64url'),
                publicKey: new Uint8Array(credential.getDecryptedPublicKey()),
                counter: credential.counter,
                transports: credential.transports as any,
            },
        });
        console.log('[verifyLogin] verifyAuthenticationResponse success. Verified:', verification.verified);
    } catch (error: any) {
        console.error('[verifyLogin] verifyAuthenticationResponse threw error:', error.message);
        return next(new AppError(error.message, 400));
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

    console.log('[verifyLogin] Error: Verification failed at the end.');
    res.status(400).json({ status: 'fail', message: 'Verification failed' });
});
