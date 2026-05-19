/**
 * Apply pass 5 — backlog integrations (NEEDS-CREDS 503-stubs).
 *
 * Documented env vars:
 *   Notifications:
 *     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM     (parent / mentor email)
 *     TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER  (SMS reminders)
 *   Job feeds:
 *     LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ACCESS_TOKEN  (LinkedIn)
 *     INDEED_PUBLISHER_ID, INDEED_API_KEY                                (Indeed)
 *   Learning catalog:
 *     COURSERA_API_KEY                                            (Coursera)
 *
 * Each route returns 503 + `{ missing: [...] }` until creds set; no SDK
 * dependency added.
 */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();
router.use(authenticateToken);

(async function ensureTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        channel VARCHAR(32) NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT,
        body TEXT,
        status VARCHAR(32) DEFAULT 'queued_stub',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notif_user_career ON notification_log(user_id);
    `);
  } catch (_) {}
})();

function missingEnv(...keys) {
  return keys.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
}
function need(envs, label, res) {
  const miss = missingEnv(...envs);
  if (miss.length) { res.status(503).json({ error: `${label} not configured`, missing: miss }); return false; }
  return true;
}

// Notifications
router.post('/notifications/email', async (req, res) => {
  if (!need(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'], 'SMTP email', res)) return;
  const { to, subject, body } = req.body || {};
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
  try {
    await pool.query(
      `INSERT INTO notification_log (user_id, channel, recipient, subject, body) VALUES ($1, 'email', $2, $3, $4)`,
      [req.user?.id || null, to, subject, body || '']
    );
  } catch (_) {}
  res.json({ status: 'queued', provider: 'smtp', note: 'stub — outbound delivery requires nodemailer dep' });
});

router.post('/notifications/sms', async (req, res) => {
  if (!need(['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'], 'Twilio SMS', res)) return;
  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body required' });
  try {
    await pool.query(
      `INSERT INTO notification_log (user_id, channel, recipient, body) VALUES ($1, 'sms', $2, $3)`,
      [req.user?.id || null, to, body]
    );
  } catch (_) {}
  res.json({ status: 'queued', provider: 'twilio', note: 'stub — outbound requires twilio dep' });
});

router.get('/notifications/log', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, channel, recipient, subject, status, created_at FROM notification_log
       WHERE user_id = $1 ORDER BY id DESC LIMIT 50`,
      [req.user?.id || null]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'failed', details: err.message }); }
});

// Job feeds
router.get('/jobs/linkedin', (req, res) => {
  if (!need(['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_ACCESS_TOKEN'], 'LinkedIn', res)) return;
  res.json({ provider: 'linkedin', jobs: [], note: 'stub — wire to LinkedIn Jobs API when ready' });
});
router.get('/jobs/indeed', (req, res) => {
  if (!need(['INDEED_PUBLISHER_ID', 'INDEED_API_KEY'], 'Indeed', res)) return;
  res.json({ provider: 'indeed', jobs: [], note: 'stub — wire to Indeed Publisher API when ready' });
});

// Learning catalog
router.get('/learning/coursera', (req, res) => {
  if (!need(['COURSERA_API_KEY'], 'Coursera', res)) return;
  res.json({ provider: 'coursera', courses: [], note: 'stub — wire to Coursera Catalog API when ready' });
});

module.exports = router;
