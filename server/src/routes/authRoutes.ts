import express from 'express';
import { register, login, getMe, updateProfile, verifyPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/verify-password', protect, verifyPassword);

export default router;
