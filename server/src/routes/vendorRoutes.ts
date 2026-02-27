import express from 'express';
import { createVendor, getVendors, getVendorById, updateVendor, toggleVendorStatus } from '../controllers/vendorController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);
// Restrict to 'merchant' role natively if the RBAC permits, or general user for now
// router.use(restrictTo('merchant', 'admin'));

router.post('/', createVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);
router.patch('/:id', updateVendor);
router.patch('/:id/status', toggleVendorStatus);

export default router;
