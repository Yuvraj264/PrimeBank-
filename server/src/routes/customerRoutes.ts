import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomerStatus, createCustomer } from '../controllers/customerController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'employee'));

router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.patch('/:id/status', updateCustomerStatus);

export default router;
