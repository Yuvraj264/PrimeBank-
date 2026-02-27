import express from 'express';
import { getPendingReviews, getHighRiskUsers, reviewActivity, addToSanctionList, updateUserRiskProfile, generateReport } from '../controllers/complianceController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { checkPermission } from '../middlewares/rbacMiddleware';

const router = express.Router();

// ALL compliance routes are strictly for Admins and Compliance Officers
router.use(protect, restrictTo('admin', 'employee'));

router.get('/suspicious', checkPermission('fraud:investigate'), getPendingReviews);
router.get('/high-risk-users', checkPermission('fraud:investigate'), getHighRiskUsers);
router.post('/sanctions', checkPermission('fraud:investigate'), addToSanctionList);
router.patch('/review/:id', checkPermission('fraud:investigate'), reviewActivity);
router.patch('/user/:id/risk', checkPermission('fraud:investigate'), updateUserRiskProfile);

router.get('/reports/:type', checkPermission('report:generate'), generateReport);

export default router;
