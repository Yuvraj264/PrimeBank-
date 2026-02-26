import express from 'express';
import { getMyAccounts, createAccount, getAccountById, getStatements } from '../controllers/accountController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getMyAccounts);
router.post('/', createAccount);
router.get('/statements', getStatements);
router.get('/:id', getAccountById);

export default router;
