import express from 'express';
import { createTicket, getMyTickets, getAllTickets, updateTicketStatus } from '../controllers/supportController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createTicket);
router.get('/', getMyTickets);

// Admin routes
router.use(restrictTo('admin', 'employee'));
router.get('/all', getAllTickets);
router.patch('/:id/status', updateTicketStatus);

export default router;
