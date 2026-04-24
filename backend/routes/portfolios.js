const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolios ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolios WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, projects, skills_showcased } = req.body;
    const result = await pool.query(
      'INSERT INTO portfolios (user_id, title, description, projects, skills_showcased) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, description, projects, skills_showcased]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, projects, skills_showcased } = req.body;
    const result = await pool.query(
      'UPDATE portfolios SET title=$1, description=$2, projects=$3, skills_showcased=$4 WHERE id=$5 RETURNING *',
      [title, description, projects, skills_showcased, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM portfolios WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-suggest', authenticateToken, async (req, res) => {
  try {
    const { career_field, skill_level, interests } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a portfolio building expert. Suggest portfolio projects and structure. Format with project ideas, technologies to use, and presentation tips.' },
      { role: 'user', content: `Suggest portfolio projects:\n\nCareer Field: ${career_field}\nSkill Level: ${skill_level}\nInterests: ${interests}\n\nSuggest 5 portfolio project ideas with details.` }
    ]);
    res.json({ suggestions: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
