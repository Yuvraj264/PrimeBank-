import express from 'express';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;
