import express from 'express';
import { register, login, refresh, logout, getMe, updateProfile, verifyPassword, setTransactionPin } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/verify-password', protect, verifyPassword);
router.post('/set-pin', protect, setTransactionPin);

export default router;
