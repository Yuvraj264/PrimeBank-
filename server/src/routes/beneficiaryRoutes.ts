import express from 'express';
import { addBeneficiary, getBeneficiaries, deleteBeneficiary } from '../controllers/beneficiaryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', addBeneficiary);
router.get('/', getBeneficiaries);
router.delete('/:id', deleteBeneficiary);

export default router;
