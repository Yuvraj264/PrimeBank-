import express from 'express';
import { getGSTSummary } from '../controllers/gstController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/summary', getGSTSummary);

export default router;
