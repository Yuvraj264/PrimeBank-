import express from 'express';
import { payBill, getBillHistory, toggleAutoPay } from '../controllers/billController';
import { protect } from '../middlewares/authMiddleware';
import { transferLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.use(protect);

router.post('/pay', transferLimiter, payBill);
router.get('/history', getBillHistory);
router.patch('/:id/auto-pay', toggleAutoPay);

export default router;
