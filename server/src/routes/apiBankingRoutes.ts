import express from 'express';
import { generateApiKey, getApiConfig, updateWebhook } from '../controllers/apiBankingController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

// Merchant portal endpoints to manage their API Keys
router.use(protect);
router.use(restrictTo('merchant', 'admin'));

router.get('/config', getApiConfig);
router.post('/generate-key', generateApiKey);
router.patch('/webhook', updateWebhook);

export default router;
