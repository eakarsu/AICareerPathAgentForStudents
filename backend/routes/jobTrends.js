const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_trends ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_trends WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, industry, demand_level, growth_percentage, avg_salary, location, description } = req.body;
    const result = await pool.query(
      'INSERT INTO job_trends (title, industry, demand_level, growth_percentage, avg_salary, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, industry, demand_level, growth_percentage, avg_salary, location, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, industry, demand_level, growth_percentage, avg_salary, location, description } = req.body;
    const result = await pool.query(
      'UPDATE job_trends SET title=$1, industry=$2, demand_level=$3, growth_percentage=$4, avg_salary=$5, location=$6, description=$7 WHERE id=$8 RETURNING *',
      [title, industry, demand_level, growth_percentage, avg_salary, location, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM job_trends WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { industry, region } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a job market analyst. Provide detailed market trend analysis. Use sections, statistics, and actionable insights. Format professionally with headers, bullet points, and trend indicators (📈 Growing, 📉 Declining, ➡️ Stable).' },
      { role: 'user', content: `Analyze job market trends for:\n\nIndustry: ${industry}\nRegion: ${region}\n\nInclude top growing roles, salary trends, and future predictions.` }
    ]);
    res.json({ analysis: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
