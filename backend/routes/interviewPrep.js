const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const CAREER_BOT_SYSTEM = 'You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance with deep knowledge of job market trends and educational pathways.';

// GET /api/interview-prep - with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM interview_questions');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM interview_questions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
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

// GET /api/interview-prep/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM interview_questions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interview-prep
router.post('/', authenticateToken,
  [
    body('question').trim().notEmpty().withMessage('question is required'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

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
  }
);

// PUT /api/interview-prep/:id
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

// DELETE /api/interview-prep/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM interview_questions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interview-prep/generate-questions
// Takes { job_title, experience_level } → generates 10 targeted questions
router.post('/generate-questions', authenticateToken, aiRateLimiter,
  [
    body('job_title').trim().notEmpty().withMessage('job_title is required'),
    body('experience_level').trim().notEmpty().withMessage('experience_level is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { job_title, experience_level } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert interview coach. Generate targeted interview questions. Return JSON:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "category": "behavioral"|"technical"|"situational"|"competency"|"culture_fit",
      "difficulty": "easy"|"medium"|"hard",
      "what_interviewers_look_for": string,
      "sample_answer_structure": string,
      "tips": [string]
    }
  ],
  "preparation_tips": [string],
  "common_mistakes": [string]
}`,
        },
        {
          role: 'user',
          content: `Generate 10 targeted interview questions for:\n\nJob Title: ${job_title}\nExperience Level: ${experience_level}\n\nInclude a mix of behavioral, technical, and situational questions appropriate for this level.`,
        },
      ]);

      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch {
        result = { raw: aiResponse };
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/interview-prep/evaluate-answer
// Takes { question, answer } → feedback on delivery, clarity, content
router.post('/evaluate-answer', authenticateToken, aiRateLimiter,
  [
    body('question').trim().notEmpty().withMessage('question is required'),
    body('answer').trim().notEmpty().withMessage('answer is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { question, answer, job_title } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert interview coach. Evaluate interview answers and provide constructive feedback. Return JSON:
{
  "overall_score": number (0-100),
  "grade": "Excellent"|"Good"|"Needs Improvement"|"Poor",
  "delivery": {
    "score": number (0-100),
    "feedback": string,
    "tips": [string]
  },
  "clarity": {
    "score": number (0-100),
    "feedback": string,
    "tips": [string]
  },
  "content": {
    "score": number (0-100),
    "feedback": string,
    "missing_elements": [string],
    "strong_points": [string]
  },
  "improved_answer_example": string,
  "star_method_breakdown": { "situation": string, "task": string, "action": string, "result": string },
  "overall_feedback": string
}`,
        },
        {
          role: 'user',
          content: `Evaluate this interview answer:\n\nQuestion: ${question}\n${job_title ? `Job Title: ${job_title}\n` : ''}Answer: ${answer}`,
        },
      ]);

      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch {
        result = { raw: aiResponse };
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/interview-prep/ai-mock-interview (legacy endpoint preserved)
router.post('/ai-mock-interview', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { career, experience_level, question_type } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: `${CAREER_BOT_SYSTEM} You are an expert interview coach. Generate realistic interview questions with detailed sample answers and tips. Format with numbered questions, sample answers in blockquotes, and pro tips highlighted.` },
      { role: 'user', content: `Generate mock interview questions:\n\nCareer: ${career}\nExperience Level: ${experience_level}\nQuestion Type: ${question_type}\n\nProvide 5 questions with sample answers and tips.` }
    ]);
    res.json({ interview: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
