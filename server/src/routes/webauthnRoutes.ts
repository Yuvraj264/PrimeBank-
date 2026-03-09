import express from 'express';
import { generateRegistrationChallenge, verifyRegistration, generateLoginChallenge, verifyLogin } from '../controllers/webauthnController';
import { protect } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// Registration flows require user to be currently logged in (to associate device with their account)
router.post('/register/generate-options', protect, generateRegistrationChallenge);
router.post('/register/verify', protect, verifyRegistration);

// Authentication flows do NOT require user to be logged in (this IS the login flow)
router.post('/login/generate-options', authLimiter, generateLoginChallenge);
router.post('/login/verify', authLimiter, verifyLogin);

export default router;
