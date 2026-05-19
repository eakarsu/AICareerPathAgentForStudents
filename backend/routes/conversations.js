const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Ensure tables exist (idempotent)
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      title       VARCHAR(500),
      context     TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id              SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role            VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
      content         TEXT NOT NULL,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS resume_versions (
      id          SERIAL PRIMARY KEY,
      resume_id   INTEGER NOT NULL,
      content     TEXT NOT NULL,
      version     INTEGER NOT NULL DEFAULT 1,
      change_note TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id    ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
  `);
}

ensureTables().catch(err => console.error('Table init error:', err.message));

// POST /api/conversations - Start new conversation
router.post('/', authenticateToken,
  [body('title').optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { title, context } = req.body;
      const result = await pool.query(
        `INSERT INTO conversations (user_id, title, context) VALUES ($1, $2, $3) RETURNING *`,
        [req.user.id, title || 'New Conversation', context || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/conversations - List user's conversations (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM conversations WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:id/messages - Get message history
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const convResult = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (convResult.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE conversation_id = $1',
      [req.params.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
      [req.params.id, limit, offset]
    );

    res.json({
      conversation: convResult.rows[0],
      data: result.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/:id/messages - Save message + AI response
router.post('/:id/messages', authenticateToken,
  [
    body('role').isIn(['user', 'assistant', 'system']).withMessage('role must be user, assistant, or system'),
    body('content').trim().notEmpty().withMessage('content is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      // Verify ownership
      const convResult = await pool.query(
        'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      if (convResult.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });

      const { role, content } = req.body;
      const result = await pool.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [req.params.id, role, content]
      );

      // Update conversation timestamp
      await pool.query(
        'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
        [req.params.id]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/conversations/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
