const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, target_role, experience_level } = req.body;
    const result = await pool.query(
      'INSERT INTO resumes (user_id, title, content, target_role, experience_level) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, content, target_role, experience_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, target_role, experience_level } = req.body;
    const result = await pool.query(
      'UPDATE resumes SET title=$1, content=$2, target_role=$3, experience_level=$4 WHERE id=$5 RETURNING *',
      [title, content, target_role, experience_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM resumes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-build', authenticateToken, async (req, res) => {
  try {
    const { name, education, skills, experience, target_role } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are an expert resume writer. Create professional resume content and provide improvement suggestions. Format with clear sections (Summary, Experience, Skills, Education) and use action verbs and quantifiable achievements.' },
      { role: 'user', content: `Build a resume for:\n\nName: ${name}\nEducation: ${education}\nSkills: ${skills}\nExperience: ${experience}\nTarget Role: ${target_role}\n\nCreate a professional resume with improvement tips.` }
    ]);
    res.json({ resume: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
