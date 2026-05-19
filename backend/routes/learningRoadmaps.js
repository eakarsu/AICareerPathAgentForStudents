const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM learning_roadmaps');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM learning_roadmaps ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      data: result.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM learning_roadmaps WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, career_path, steps, duration, description } = req.body;
    const result = await pool.query(
      'INSERT INTO learning_roadmaps (title, career_path, steps, duration, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, career_path, steps, duration, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, career_path, steps, duration, description } = req.body;
    const result = await pool.query(
      'UPDATE learning_roadmaps SET title=$1, career_path=$2, steps=$3, duration=$4, description=$5 WHERE id=$6 RETURNING *',
      [title, career_path, steps, duration, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM learning_roadmaps WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { career_goal, current_level, timeline } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a learning path designer. Create detailed step-by-step learning roadmaps. Format with phases, milestones, resources, and time estimates for each step.' },
      { role: 'user', content: `Generate a learning roadmap:\n\nCareer Goal: ${career_goal}\nCurrent Level: ${current_level}\nTimeline: ${timeline}\n\nCreate a detailed step-by-step roadmap.` }
    ]);
    res.json({ roadmap: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
