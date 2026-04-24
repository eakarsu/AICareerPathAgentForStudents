const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM salary_insights ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM salary_insights WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { role, industry, entry_level, mid_level, senior_level, location, description } = req.body;
    const result = await pool.query(
      'INSERT INTO salary_insights (role, industry, entry_level, mid_level, senior_level, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [role, industry, entry_level, mid_level, senior_level, location, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { role, industry, entry_level, mid_level, senior_level, location, description } = req.body;
    const result = await pool.query(
      'UPDATE salary_insights SET role=$1, industry=$2, entry_level=$3, mid_level=$4, senior_level=$5, location=$6, description=$7 WHERE id=$8 RETURNING *',
      [role, industry, entry_level, mid_level, senior_level, location, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM salary_insights WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-estimate', authenticateToken, async (req, res) => {
  try {
    const { role, location, experience } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a compensation analyst. Provide detailed salary insights and negotiation tips. Format with salary ranges by level, factors affecting pay, benefits to consider, and negotiation strategies.' },
      { role: 'user', content: `Provide salary insights:\n\nRole: ${role}\nLocation: ${location}\nExperience: ${experience}\n\nInclude salary ranges, growth trajectory, and negotiation tips.` }
    ]);
    res.json({ estimate: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
