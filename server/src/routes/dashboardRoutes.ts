import express from 'express';
import { getOverview, getRecentTransactions } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/recent-transactions', getRecentTransactions);

export default router;
