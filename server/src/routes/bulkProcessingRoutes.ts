import express from 'express';
import fileUpload from 'express-fileupload';
import { processPayrollCSV, getProcessingJobs } from '../controllers/bulkProcessingController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

// Allow up to 10MB CSV uploads for enterprise merchants
router.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
}));

// Route for payroll execution
router.post('/payroll', processPayrollCSV);

// Route to fetch past execution histories and error reports
router.get('/jobs', getProcessingJobs);

export default router;
