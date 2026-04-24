const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, assessment_type, questions, results } = req.body;
    const result = await pool.query(
      'INSERT INTO assessments (user_id, title, assessment_type, questions, results) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, assessment_type, questions, results]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, assessment_type, questions, results } = req.body;
    const result = await pool.query(
      'UPDATE assessments SET title=$1, assessment_type=$2, questions=$3, results=$4 WHERE id=$5 RETURNING *',
      [title, assessment_type, questions, results, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM assessments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-assess', authenticateToken, async (req, res) => {
  try {
    const { personality_traits, interests, strengths, values } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a career assessment expert using validated frameworks like Holland Codes (RIASEC), Myers-Briggs, and StrengthsFinder. Provide personalized career assessment results. Format with personality profile, career matches with match percentages, and detailed explanations.' },
      { role: 'user', content: `Perform career assessment:\n\nPersonality Traits: ${personality_traits}\nInterests: ${interests}\nStrengths: ${strengths}\nValues: ${values}\n\nProvide career matches with percentages and detailed analysis.` }
    ]);
    res.json({ assessment: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
