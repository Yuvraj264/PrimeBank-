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
import express from 'express';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/accounts', getAllAccounts);
router.patch('/accounts/:id/status', updateAccountStatus); // New
router.get('/transactions/flagged', getFlaggedTransactions);
router.patch('/transactions/:id/resolve', resolveFraudAlert); // New
router.get('/config', getSystemConfig);
router.patch('/config', updateSystemConfig);

router.patch('/employees/:id/role', updateEmployeeRole);
router.get('/fraud/blacklist', getBlacklistedIPs);
router.post('/fraud/blacklist', blacklistIP);
export default router;
