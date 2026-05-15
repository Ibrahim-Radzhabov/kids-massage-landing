const rateLimit = require('express-rate-limit');

const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    ok: false,
    error: 'rate_limited'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = leadLimiter;
