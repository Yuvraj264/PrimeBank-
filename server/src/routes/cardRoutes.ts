import express from 'express';
import { getMyCards, getCardDetails, createCard, toggleCardFreeze, updateCardLimits, createVirtualCard, reportLostCard } from '../controllers/cardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getMyCards);
router.get('/:id', getCardDetails);
router.post('/', createCard);
router.post('/virtual', createVirtualCard);
router.patch('/:id/freeze', toggleCardFreeze);
router.patch('/:id/limits', updateCardLimits);
router.post('/:id/report-lost', reportLostCard);

export default router;
