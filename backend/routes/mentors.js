const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, title, company, industry, expertise, bio, availability } = req.body;
    const result = await pool.query(
      'INSERT INTO mentors (name, title, company, industry, expertise, bio, availability) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, title, company, industry, expertise, bio, availability]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, title, company, industry, expertise, bio, availability } = req.body;
    const result = await pool.query(
      'UPDATE mentors SET name=$1, title=$2, company=$3, industry=$4, expertise=$5, bio=$6, availability=$7 WHERE id=$8 RETURNING *',
      [name, title, company, industry, expertise, bio, availability, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mentors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-match', authenticateToken, async (req, res) => {
  try {
    const { career_interest, goals, preferred_style } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a mentorship matching expert. Suggest ideal mentor profiles and mentoring strategies. Format with mentor type recommendations, what to look for, and how to approach mentorship.' },
      { role: 'user', content: `Find ideal mentor match:\n\nCareer Interest: ${career_interest}\nGoals: ${goals}\nPreferred Mentoring Style: ${preferred_style}\n\nSuggest mentor types and mentoring strategies.` }
    ]);
    res.json({ match: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
