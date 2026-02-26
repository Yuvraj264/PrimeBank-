import express from 'express';
import { applyLoan, getMyLoans, getAllLoans, updateLoanStatus, prepayLoan } from '../controllers/loanController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { transferLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/apply', applyLoan);
router.get('/', getMyLoans);
router.post('/prepay', transferLimiter, prepayLoan);

// Employee/Admin routes
router.get('/all', restrictTo('admin', 'employee'), getAllLoans);
router.patch('/:id/status', restrictTo('admin', 'employee'), updateLoanStatus);

export default router;
