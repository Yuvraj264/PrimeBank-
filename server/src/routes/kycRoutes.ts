import express from 'express';
import { submitKYC, getAllKYCRequests, getPendingKYCRequests, updateKYCStatus } from '../controllers/kycController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/submit', submitKYC);

// Employee/Admin routes
router.get('/all', restrictTo('admin', 'employee'), getAllKYCRequests);
router.get('/pending', restrictTo('admin', 'employee'), getPendingKYCRequests);
router.patch('/:id/status', restrictTo('admin', 'employee'), updateKYCStatus);

export default router;
