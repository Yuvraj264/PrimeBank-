import express from 'express';
import { transferFound, getMyTransactions, deposit, withdraw, payBill } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/me', getMyTransactions);
router.post('/transfer', transferFound);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/bill-pay', payBill);

export default router;
