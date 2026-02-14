import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomerStatus } from '../controllers/customerController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'employee'));

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.patch('/:id/status', updateCustomerStatus);

export default router;
