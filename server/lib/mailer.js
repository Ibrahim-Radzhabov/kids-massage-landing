const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function validateSmtpConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'MAIL_TO'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing SMTP environment variables: ${missing.join(', ')}`);
  }
}

async function sendLeadEmail(leadData) {
  validateSmtpConfig();
  const { name, phone, age, concern, ip, userAgent } = leadData;
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: 'Новая заявка с сайта Кроха и Я',
    text: `
Новая заявка на детский массаж:
-------------------------------
Имя: ${name}
Телефон: ${phone}
Возраст ребенка: ${age}
Что беспокоит: ${concern || 'Не указано'}

Техническая информация:
-------------------------------
Время: ${time} (МСК)
IP: ${ip}
User-Agent: ${userAgent}
`,
    html: `
<h3>Новая заявка на детский массаж</h3>
<p><strong>Имя:</strong> ${name}</p>
<p><strong>Телефон:</strong> ${phone}</p>
<p><strong>Возраст ребенка:</strong> ${age}</p>
<p><strong>Что беспокоит:</strong> ${concern || 'Не указано'}</p>
<br>
<hr>
<p><small>Техническая информация:</small></p>
<ul>
  <li><small>Время: ${time} (МСК)</small></li>
  <li><small>IP: ${ip}</small></li>
  <li><small>User-Agent: ${userAgent}</small></li>
</ul>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { ok: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}

module.exports = { sendLeadEmail };
