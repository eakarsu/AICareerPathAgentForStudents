const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM industry_insights ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM industry_insights WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { industry, overview, trends, top_companies, challenges, opportunities } = req.body;
    const result = await pool.query(
      'INSERT INTO industry_insights (industry, overview, trends, top_companies, challenges, opportunities) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [industry, overview, trends, top_companies, challenges, opportunities]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { industry, overview, trends, top_companies, challenges, opportunities } = req.body;
    const result = await pool.query(
      'UPDATE industry_insights SET industry=$1, overview=$2, trends=$3, top_companies=$4, challenges=$5, opportunities=$6 WHERE id=$7 RETURNING *',
      [industry, overview, trends, top_companies, challenges, opportunities, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM industry_insights WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { industry, aspect } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an industry analyst. Provide deep industry insights and analysis. Format with sections for overview, trends, opportunities, challenges, and key players.' },
      { role: 'user', content: `Analyze this industry:\n\nIndustry: ${industry}\nFocus Area: ${aspect}\n\nProvide comprehensive industry insights.` }
    ]);
    res.json({ insights: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
