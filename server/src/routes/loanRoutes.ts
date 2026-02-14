import express from 'express';
import { applyLoan, getMyLoans, getAllLoans, updateLoanStatus } from '../controllers/loanController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/apply', applyLoan);
router.get('/my-loans', getMyLoans);

// Employee/Admin routes
router.get('/all', restrictTo('admin', 'employee'), getAllLoans);
router.patch('/:id/status', restrictTo('admin', 'employee'), updateLoanStatus);

export default router;
