const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, provider, description, duration, level, url, career_path_id } = req.body;
    const result = await pool.query(
      'INSERT INTO courses (title, provider, description, duration, level, url, career_path_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, provider, description, duration, level, url, career_path_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, provider, description, duration, level, url, career_path_id } = req.body;
    const result = await pool.query(
      'UPDATE courses SET title=$1, provider=$2, description=$3, duration=$4, level=$5, url=$6, career_path_id=$7 WHERE id=$8 RETURNING *',
      [title, provider, description, duration, level, url, career_path_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-recommend', authenticateToken, async (req, res) => {
  try {
    const { career_goal, current_level, budget } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an expert educational advisor. Recommend specific courses and learning paths. Format with clear sections, course names, platforms, estimated duration, and difficulty levels.' },
      { role: 'user', content: `Recommend courses for:\n\nCareer Goal: ${career_goal}\nCurrent Level: ${current_level}\nBudget: ${budget}\n\nSuggest 5-7 courses with details.` }
    ]);
    res.json({ recommendations: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
