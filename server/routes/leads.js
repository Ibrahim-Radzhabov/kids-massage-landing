const express = require('express');
const router = express.Router();
const leadLimiter = require('../middleware/leadRateLimit');
const { sendLeadEmail } = require('../lib/mailer');

// POST /api/leads
router.post('/', leadLimiter, async (req, res) => {
  let { name, phone, age, concern, consent, website } = req.body;

  // 1. Honeypot check
  if (website) {
    return res.status(201).json({ ok: true });
  }

  // 2. Normalization
  name = (name || '').trim();
  phone = (phone || '').trim();
  age = (age || '').trim();
  concern = (concern || '').trim();

  // 3. Validation
  const errors = {};
  if (name.length < 2 || name.length > 60) {
    errors.name = 'Имя должно быть от 2 до 60 символов';
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    errors.phone = 'Некорректный номер телефона (минимум 10 цифр)';
  }
  if (!age) {
    errors.age = 'Укажите возраст ребенка';
  }
  if (concern.length > 500) {
    errors.concern = 'Сообщение слишком длинное (макс 500 символов)';
  }
  if (consent !== true && consent !== 'true') {
    errors.consent = 'Необходимо согласие на обработку персональных данных';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'validation_error',
      details: errors
    });
  }

  // 4. Send Email (do not store lead anywhere)
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await sendLeadEmail({
      name,
      phone,
      age,
      concern,
      ip,
      userAgent
    });

    // Safe log: no PII
    console.log(`[LEAD] Email sent successfully at ${new Date().toISOString()}`);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Lead route error:', err.message);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

module.exports = router;
