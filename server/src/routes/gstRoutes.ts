import express from 'express';
import { getGSTSummary } from '../controllers/gstController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

// Merchant portal endpoints - requires merchant role
router.use(protect);
router.use(restrictTo('merchant', 'admin'));

router.get('/summary', getGSTSummary);

export default router;
