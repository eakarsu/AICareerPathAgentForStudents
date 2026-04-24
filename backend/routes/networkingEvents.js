const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM networking_events ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM networking_events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, event_date, location, event_type, description, industry, url } = req.body;
    const result = await pool.query(
      'INSERT INTO networking_events (title, event_date, location, event_type, description, industry, url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, event_date, location, event_type, description, industry, url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, event_date, location, event_type, description, industry, url } = req.body;
    const result = await pool.query(
      'UPDATE networking_events SET title=$1, event_date=$2, location=$3, event_type=$4, description=$5, industry=$6, url=$7 WHERE id=$8 RETURNING *',
      [title, event_date, location, event_type, description, industry, url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM networking_events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-suggest', authenticateToken, async (req, res) => {
  try {
    const { career_field, location, networking_goals } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are a networking and career events expert. Suggest networking strategies and event types. Format with event categories, tips, and preparation advice.' },
      { role: 'user', content: `Suggest networking events and strategies:\n\nCareer Field: ${career_field}\nLocation: ${location}\nNetworking Goals: ${networking_goals}\n\nProvide event types, platforms, and networking tips.` }
    ]);
    res.json({ suggestions: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
