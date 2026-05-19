const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const CAREER_BOT_SYSTEM = 'You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance with deep knowledge of job market trends and educational pathways.';

// GET /api/resumes - with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM resumes');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM resumes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
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

// GET /api/resumes/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes
router.post('/', authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('content').trim().notEmpty().withMessage('content is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { title, content, target_role, experience_level } = req.body;
      const result = await pool.query(
        'INSERT INTO resumes (user_id, title, content, target_role, experience_level) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [req.user.id, title, content, target_role, experience_level]
      );

      // Save initial version
      try {
        await pool.query(
          'INSERT INTO resume_versions (resume_id, content, version, change_note) VALUES ($1, $2, 1, $3)',
          [result.rows[0].id, content, 'Initial version']
        );
      } catch (_) {}

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/resumes/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, target_role, experience_level } = req.body;
    const result = await pool.query(
      'UPDATE resumes SET title=$1, content=$2, target_role=$3, experience_level=$4 WHERE id=$5 RETURNING *',
      [title, content, target_role, experience_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    // Save version on update
    try {
      const versionCount = await pool.query(
        'SELECT COUNT(*) FROM resume_versions WHERE resume_id = $1',
        [req.params.id]
      );
      const nextVersion = parseInt(versionCount.rows[0].count) + 1;
      await pool.query(
        'INSERT INTO resume_versions (resume_id, content, version, change_note) VALUES ($1, $2, $3, $4)',
        [req.params.id, content, nextVersion, 'Manual update']
      );
    } catch (_) {}

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM resumes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes/:id/enhance - AI resume enhancement
router.post('/:id/enhance', authenticateToken, aiRateLimiter,
  [
    body('job_description').trim().notEmpty().withMessage('job_description is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const resumeResult = await pool.query('SELECT * FROM resumes WHERE id = $1', [req.params.id]);
      if (resumeResult.rows.length === 0) return res.status(404).json({ error: 'Resume not found' });

      const resume = resumeResult.rows[0];
      const { job_description } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert resume writer and career coach. Enhance resume content to be more impactful, ATS-friendly, and targeted to the specific job description. Return your response as JSON with this structure:
{
  "enhanced_bullets": [{ "original": string, "enhanced": string, "reason": string }],
  "summary_suggestion": string,
  "skills_to_add": [string],
  "keywords_to_include": [string],
  "overall_improvements": [string],
  "ats_score_estimate": number,
  "ats_tips": [string]
}`,
        },
        {
          role: 'user',
          content: `Enhance this resume for the given job description:\n\nRESUME:\n${resume.content}\n\nJOB DESCRIPTION:\n${job_description}`,
        },
      ]);

      let enhancedData;
      try {
        enhancedData = JSON.parse(aiResponse);
      } catch {
        enhancedData = { raw: aiResponse, error: 'Could not parse structured response' };
      }

      // Save enhanced version
      try {
        const versionCount = await pool.query(
          'SELECT COUNT(*) FROM resume_versions WHERE resume_id = $1',
          [req.params.id]
        );
        const nextVersion = parseInt(versionCount.rows[0].count) + 1;
        await pool.query(
          'INSERT INTO resume_versions (resume_id, content, version, change_note) VALUES ($1, $2, $3, $4)',
          [req.params.id, JSON.stringify(enhancedData), nextVersion, `AI enhanced for: ${job_description.substring(0, 100)}`]
        );
      } catch (_) {}

      res.json(enhancedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/resumes/bullet-generator - Generate impact-focused bullets
router.post('/bullet-generator', authenticateToken, aiRateLimiter,
  [
    body('job_description').trim().notEmpty().withMessage('job_description is required'),
    body('experience').trim().notEmpty().withMessage('experience is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { job_description, experience } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert resume writer. Generate strong, impact-focused resume bullet points. Use the STAR method (Situation, Task, Action, Result) and quantify achievements where possible. Return JSON:
{
  "bullets": [{ "bullet": string, "impact_level": "High"|"Medium"|"Low", "keywords_used": [string] }],
  "tips": [string],
  "action_verbs_used": [string]
}`,
        },
        {
          role: 'user',
          content: `Generate resume bullet points:\n\nJOB DESCRIPTION:\n${job_description}\n\nEXPERIENCE TO TRANSFORM:\n${experience}`,
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

// POST /api/resumes/ai-build
router.post('/ai-build', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { name, education, skills, experience, target_role } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: `${CAREER_BOT_SYSTEM} You are an expert resume writer. Create professional resume content and provide improvement suggestions. Format with clear sections (Summary, Experience, Skills, Education) and use action verbs and quantifiable achievements.` },
      { role: 'user', content: `Build a resume for:\n\nName: ${name}\nEducation: ${education}\nSkills: ${skills}\nExperience: ${experience}\nTarget Role: ${target_role}\n\nCreate a professional resume with improvement tips.` }
    ]);
    res.json({ resume: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
