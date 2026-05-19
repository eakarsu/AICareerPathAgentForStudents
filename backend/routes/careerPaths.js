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

    const countResult = await pool.query('SELECT COUNT(*) FROM career_paths');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM career_paths ORDER BY created_at DESC LIMIT $1 OFFSET $2',
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
    const result = await pool.query('SELECT * FROM career_paths WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, industry, avg_salary, growth_rate, education_required, skills } = req.body;
    const result = await pool.query(
      'INSERT INTO career_paths (title, description, industry, avg_salary, growth_rate, education_required, skills) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, industry, avg_salary, growth_rate, education_required, skills]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, industry, avg_salary, growth_rate, education_required, skills } = req.body;
    const result = await pool.query(
      'UPDATE career_paths SET title=$1, description=$2, industry=$3, avg_salary=$4, growth_rate=$5, education_required=$6, skills=$7 WHERE id=$8 RETURNING *',
      [title, description, industry, avg_salary, growth_rate, education_required, skills, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM career_paths WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-recommend', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { interests, skills, education } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an expert career counselor for students. Provide detailed, actionable career path recommendations. Format your response with clear sections using markdown-style headers (##), bullet points, and bold text for emphasis. Include specific career titles, expected salary ranges, and growth prospects.' },
      { role: 'user', content: `Based on these details, recommend career paths:\n\nInterests: ${interests}\nSkills: ${skills}\nEducation: ${education}\n\nProvide 3-5 career recommendations with details.` }
    ]);
    res.json({ recommendation: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
