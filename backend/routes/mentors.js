const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/mentors - with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM mentors');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM mentors ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentors/match - Ranked mentors with match_score
router.get('/match', authenticateToken, async (req, res) => {
  try {
    const { interests, skills } = req.query;
    // interests and skills are comma-separated strings
    const interestList = interests ? interests.split(',').map(s => s.trim().toLowerCase()) : [];
    const skillList = skills ? skills.split(',').map(s => s.trim().toLowerCase()) : [];

    const allMentors = await pool.query('SELECT * FROM mentors');

    const scored = allMentors.rows.map(mentor => {
      const expertise = (mentor.expertise || '').toLowerCase();
      const industry = (mentor.industry || '').toLowerCase();
      const bio = (mentor.bio || '').toLowerCase();
      const combined = `${expertise} ${industry} ${bio}`;

      let score = 0;
      const matchingReasons = [];

      for (const interest of interestList) {
        if (combined.includes(interest)) {
          score += 20;
          matchingReasons.push(`Expertise aligns with your interest in "${interest}"`);
        }
      }

      for (const skill of skillList) {
        if (combined.includes(skill)) {
          score += 15;
          matchingReasons.push(`Mentor has experience with "${skill}"`);
        }
      }

      // Bonus for availability
      if (mentor.availability && mentor.availability.toLowerCase() !== 'unavailable') {
        score += 10;
        matchingReasons.push('Currently available for mentorship');
      }

      return {
        ...mentor,
        match_score: Math.min(100, score),
        matching_reasons: matchingReasons.length > 0 ? matchingReasons : ['General mentorship match'],
      };
    });

    // Sort by match_score descending
    scored.sort((a, b) => b.match_score - a.match_score);

    res.json({ data: scored, query: { interests, skills } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentors/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mentors
router.post('/', authenticateToken,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('industry').optional().trim(),
    body('expertise').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

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
  }
);

// PUT /api/mentors/:id
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

// DELETE /api/mentors/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mentors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mentors/ai-match
router.post('/ai-match', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { career_interest, goals, preferred_style } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: 'You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance with deep knowledge of job market trends and educational pathways. As a mentorship matching expert, suggest ideal mentor profiles and mentoring strategies.' },
      { role: 'user', content: `Find ideal mentor match:\n\nCareer Interest: ${career_interest}\nGoals: ${goals}\nPreferred Mentoring Style: ${preferred_style}\n\nSuggest mentor types and mentoring strategies.` }
    ]);
    res.json({ match: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
