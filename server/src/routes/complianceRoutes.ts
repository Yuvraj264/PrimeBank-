import express from 'express';
import { getPendingReviews, getHighRiskUsers, reviewActivity, addToSanctionList, updateUserRiskProfile } from '../controllers/complianceController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

// ALL compliance routes are strictly for Admins and Compliance Officers
router.use(protect, restrictTo('admin', 'employee'));

router.get('/suspicious', getPendingReviews);
router.get('/high-risk-users', getHighRiskUsers);
router.post('/sanctions', addToSanctionList);
router.patch('/review/:id', reviewActivity);
router.patch('/user/:id/risk', updateUserRiskProfile);

export default router;
