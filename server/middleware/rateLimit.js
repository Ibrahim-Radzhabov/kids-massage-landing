const rateLimit = require('express-rate-limit');

const reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    ok: false,
    error: 'rate_limited',
    details: 'Too many reviews from this IP, please try again after 10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = reviewLimiter;
