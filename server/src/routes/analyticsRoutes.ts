import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { getDashboardMetrics, runManualAggregation } from '../controllers/analyticsController';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'superadmin')); // Add any business level admin roles

router.get('/dashboard', getDashboardMetrics);
router.post('/trigger', runManualAggregation); // Useful for manual backfilling

export default router;
