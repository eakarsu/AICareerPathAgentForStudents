const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM interview_questions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM interview_questions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { question, category, difficulty, career_path, sample_answer, tips } = req.body;
    const result = await pool.query(
      'INSERT INTO interview_questions (question, category, difficulty, career_path, sample_answer, tips) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [question, category, difficulty, career_path, sample_answer, tips]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { question, category, difficulty, career_path, sample_answer, tips } = req.body;
    const result = await pool.query(
      'UPDATE interview_questions SET question=$1, category=$2, difficulty=$3, career_path=$4, sample_answer=$5, tips=$6 WHERE id=$7 RETURNING *',
      [question, category, difficulty, career_path, sample_answer, tips, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM interview_questions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-mock-interview', authenticateToken, async (req, res) => {
  try {
    const { career, experience_level, question_type } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an expert interview coach. Generate realistic interview questions with detailed sample answers and tips. Format with numbered questions, sample answers in blockquotes, and pro tips highlighted.' },
      { role: 'user', content: `Generate mock interview questions:\n\nCareer: ${career}\nExperience Level: ${experience_level}\nQuestion Type: ${question_type}\n\nProvide 5 questions with sample answers and tips.` }
    ]);
    res.json({ interview: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
