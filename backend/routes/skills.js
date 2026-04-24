const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, description, difficulty_level, demand_level } = req.body;
    const result = await pool.query(
      'INSERT INTO skills (name, category, description, difficulty_level, demand_level) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, category, description, difficulty_level, demand_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, description, difficulty_level, demand_level } = req.body;
    const result = await pool.query(
      'UPDATE skills SET name=$1, category=$2, description=$3, difficulty_level=$4, demand_level=$5 WHERE id=$6 RETURNING *',
      [name, category, description, difficulty_level, demand_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-gap-analysis', authenticateToken, async (req, res) => {
  try {
    const { current_skills, target_career } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an expert skills analyst. Analyze skill gaps and provide actionable improvement plans. Format with clear sections, bullet points, and priority levels (🔴 Critical, 🟡 Important, 🟢 Nice to have).' },
      { role: 'user', content: `Analyze the skill gap:\n\nCurrent Skills: ${current_skills}\nTarget Career: ${target_career}\n\nIdentify missing skills, rate their importance, and suggest learning resources.` }
    ]);
    res.json({ analysis: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
