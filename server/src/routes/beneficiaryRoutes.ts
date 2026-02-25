import express from 'express';
import { addBeneficiary, getBeneficiaries, deleteBeneficiary, updateBeneficiary } from '../controllers/beneficiaryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', addBeneficiary);
router.get('/', getBeneficiaries);
router.patch('/:id', updateBeneficiary);
router.delete('/:id', deleteBeneficiary);

export default router;
