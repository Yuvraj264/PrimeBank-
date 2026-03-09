import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 5, // Limit each IP to 5 requests per windowMs (100 for dev)
    message: {
        status: 'error',
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const transferLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 transfer requests per hour
    message: {
        status: 'error',
        message: 'Transfer limit reached for this IP. Please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
