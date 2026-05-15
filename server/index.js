require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reviewsRouter = require('./routes/reviews');
const leadsRouter = require('./routes/leads');

const app = express();
const PORT = process.env.PORT || 3134;

// Trust proxy because backend sits behind nginx
app.set('trust proxy', 1);

// 1. CORS Configuration — strict, production-only
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
if (allowedOrigins.length === 0) {
  console.warn('CORS_ORIGIN is not set. CORS will block all cross-origin requests.');
}

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 2. Body parsing — limited to prevent large payloads
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// 3. API Routes
app.use('/api/reviews', reviewsRouter);
app.use('/api/leads', leadsRouter);

// 4. Basic health check
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date() });
});

// 5. Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ ok: false, error: 'server_error' });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
