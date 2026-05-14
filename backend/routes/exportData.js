/**
 * Apply pass 5 — mechanical export endpoints.
 *
 * Lets a student or admin download their profile + history as a single JSON
 * blob. No external services; no AI; reads only.
 *
 * Endpoints:
 *   GET /api/export/me          — current user's full record set
 *   GET /api/export/me.csv      — CSV-flat assessment scores
 *
 * Defensive on schema (tables may not exist in every install).
 */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();
router.use(authenticateToken);

async function safe(query, params) {
  try { const { rows } = await pool.query(query, params); return rows; }
  catch (_) { return []; }
}

router.get('/me', async (req, res) => {
  const uid = req.user?.id || null;
  const out = {
    user_id: uid,
    exported_at: new Date().toISOString(),
    assessments: await safe(`SELECT * FROM assessments WHERE user_id = $1 LIMIT 200`, [uid]),
    career_paths: await safe(`SELECT * FROM career_paths WHERE user_id = $1 LIMIT 200`, [uid]),
    portfolios: await safe(`SELECT * FROM portfolios WHERE user_id = $1 LIMIT 200`, [uid]),
    resumes: await safe(`SELECT * FROM resumes WHERE user_id = $1 LIMIT 200`, [uid]),
    learning_roadmaps: await safe(`SELECT * FROM learning_roadmaps WHERE user_id = $1 LIMIT 200`, [uid]),
    conversations: await safe(`SELECT * FROM conversations WHERE user_id = $1 ORDER BY id DESC LIMIT 100`, [uid]),
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="career-path-export-${uid || 'anon'}.json"`);
  res.send(JSON.stringify(out, null, 2));
});

router.get('/me.csv', async (req, res) => {
  const uid = req.user?.id || null;
  const rows = await safe(
    `SELECT id, COALESCE(category, type, 'assessment') AS category, COALESCE(score, 0) AS score, created_at
     FROM assessments WHERE user_id = $1 ORDER BY id DESC LIMIT 500`,
    [uid]
  );
  const header = 'id,category,score,created_at';
  const body = rows.map(r => `${r.id},"${String(r.category).replace(/"/g, '""')}",${r.score},${r.created_at}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="assessments-${uid || 'anon'}.csv"`);
  res.send(`${header}\n${body}\n`);
});

module.exports = router;
