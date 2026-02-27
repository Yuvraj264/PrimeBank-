import {
    getDashboardStats,
    getAuditLogs,
    getAllUsers,
    getAllAccounts,
    getFlaggedTransactions,
    getSystemConfig,
    updateSystemConfig,
    updateUserStatus,
    deleteUser,
    updateAccountStatus,
    resolveFraudAlert,
    updateEmployeeRole,
    getBlacklistedIPs,
    blacklistIP,
    removeBlacklistedIP
} from '../controllers/adminController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { checkPermission } from '../middlewares/rbacMiddleware';
import express from 'express';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/audit-logs', checkPermission('user:view'), getAuditLogs);
router.get('/users', checkPermission('user:view'), getAllUsers);
router.patch('/users/:id/status', checkPermission('user:freeze'), updateUserStatus);
router.delete('/users/:id', checkPermission('user:freeze'), deleteUser);
router.get('/accounts', checkPermission('user:view'), getAllAccounts);
router.patch('/accounts/:id/status', checkPermission('user:freeze'), updateAccountStatus); // New
router.get('/transactions/flagged', checkPermission('fraud:investigate'), getFlaggedTransactions);
router.patch('/transactions/:id/resolve', checkPermission('fraud:investigate'), resolveFraudAlert); // New
router.get('/config', checkPermission('user:view'), getSystemConfig);
router.patch('/config', checkPermission('user:freeze'), updateSystemConfig);

router.patch('/employees/:id/role', updateEmployeeRole);
router.get('/fraud/blacklist', getBlacklistedIPs);
router.post('/fraud/blacklist', blacklistIP);
export default router;
