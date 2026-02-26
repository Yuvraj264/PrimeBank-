import express from 'express';
import { openInvestment, getInvestments, getPerformance } from '../controllers/investmentController';
import { protect } from '../middlewares/authMiddleware';
import { transferLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.use(protect);

router.post('/open', transferLimiter, openInvestment);
router.get('/', getInvestments);
router.get('/performance', getPerformance);

export default router;
