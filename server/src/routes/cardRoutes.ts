import express from 'express';
import { getMyCards, getCardDetails, createCard, toggleCardFreeze } from '../controllers/cardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createCard);
router.get('/', getMyCards);
router.get('/:id', getCardDetails);
router.patch('/:id/freeze', toggleCardFreeze);

export default router;
