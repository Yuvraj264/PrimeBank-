import express from 'express';
import { transferFound, transferInternal, transferBank, transferScheduled, getMyTransactions, deposit, withdraw, payBill, getAllTransactions } from '../controllers/transactionController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { transferLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/', restrictTo('admin', 'employee'), getAllTransactions);
router.get('/me', getMyTransactions);
router.post('/transfer', transferLimiter, transferFound);
router.post('/transfer/internal', transferLimiter, transferInternal);
router.post('/transfer/bank', transferLimiter, transferBank);
router.post('/transfer/scheduled', transferLimiter, transferScheduled);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/bill-pay', payBill);

export default router;
