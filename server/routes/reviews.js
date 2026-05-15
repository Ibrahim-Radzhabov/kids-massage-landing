const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../lib/db');
const reviewLimiter = require('../middleware/rateLimit');

function checkDb(req, res, next) {
  if (!db) {
    return res.status(503).json({ ok: false, error: 'service_unavailable', message: 'Reviews database not configured' });
  }
  next();
}

// Auto-moderation: spam / stop-words filter
const STOP_WORDS = [
  // Obvious spam
  'казино', 'крипто', 'биткоин', 'bitcoin', 'ставки', 'букмекер',
  'виагра', 'похудеть', 'заработок', 'инвестиции', 'пирамида',
  'кредит', 'займ', 'микрозайм', 'быстрые деньги',
  // Promotional
  'продам', 'купить', 'заказать', 'скидка', 'акция', 'промокод',
  'перейдите', 'подпишись', 'подпишитесь',
];

const URL_PATTERN = /https?:\/\/|www\.|\.[a-z]{2,6}\//i;
const PHONE_PATTERN = /(\+7|8[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})/;

function containsSpam(text) {
  const lower = text.toLowerCase();
  if (URL_PATTERN.test(text)) return true;
  if (PHONE_PATTERN.test(text)) return true;
  return STOP_WORDS.some(word => lower.includes(word));
}

function isSpamReview(name, message) {
  return containsSpam(name) || containsSpam(message);
}

// GET /api/reviews
router.get('/', checkDb, (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT id, name, message, created_at FROM reviews WHERE approved = 1 ORDER BY created_at DESC LIMIT 20"
    ).all();
    res.status(200).json({ items: rows || [] });
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// POST /api/reviews
router.post('/', reviewLimiter, checkDb, (req, res) => {
  let { name, message, website } = req.body;

  // 1. Honeypot check
  if (website) {
    return res.status(201).json({ ok: true, note: 'Spam filtered' });
  }

  // 2. Normalization
  name = (name || '').trim();
  message = (message || '').trim();

  // 3. Validation
  const errors = {};
  if (name.length < 2 || name.length > 60) {
    errors.name = 'Name must be between 2 and 60 characters';
  }
  if (message.length < 10 || message.length > 1000) {
    errors.message = 'Message must be between 10 and 1000 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'validation_error',
      details: errors
    });
  }

  // 4. Auto-moderation: detect spam
  const spamDetected = isSpamReview(name, message);
  const approved = spamDetected ? 0 : 1;

  // 5. Database Insert
  try {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO reviews (id, name, message, approved) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, name, message, approved);

    // Return success regardless of spam status (don't reveal filter to abusers)
    if (spamDetected) {
      console.log(`[REVIEW] Spam filtered (id=${id})`);
    }
    res.status(201).json({ ok: true, message: 'Спасибо за отзыв!' });
  } catch (err) {
    console.error('Error saving review:', err.message);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

module.exports = router;
