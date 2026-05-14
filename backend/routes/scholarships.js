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

    const countResult = await pool.query('SELECT COUNT(*) FROM scholarships');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM scholarships ORDER BY created_at DESC LIMIT $1 OFFSET $2',
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
    const result = await pool.query('SELECT * FROM scholarships WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, provider, amount, deadline, eligibility, description, url } = req.body;
    const result = await pool.query(
      'INSERT INTO scholarships (name, provider, amount, deadline, eligibility, description, url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, provider, amount, deadline, eligibility, description, url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, provider, amount, deadline, eligibility, description, url } = req.body;
    const result = await pool.query(
      'UPDATE scholarships SET name=$1, provider=$2, amount=$3, deadline=$4, eligibility=$5, description=$6, url=$7 WHERE id=$8 RETURNING *',
      [name, provider, amount, deadline, eligibility, description, url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM scholarships WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-find', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { field_of_study, gpa, background } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a scholarship advisor. Help students find relevant scholarships. Format with scholarship categories, eligibility tips, and application strategies.' },
      { role: 'user', content: `Find scholarships for:\n\nField of Study: ${field_of_study}\nGPA: ${gpa}\nBackground: ${background}\n\nSuggest scholarship types and application tips.` }
    ]);
    res.json({ scholarships: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
