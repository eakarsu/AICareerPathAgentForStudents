const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const CAREER_BOT_SYSTEM = 'You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance with deep knowledge of job market trends and educational pathways.';

// Ensure feedback + ai_results tables exist
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_feedback (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL,
      endpoint     VARCHAR(255),
      rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
      flagged      BOOLEAN DEFAULT FALSE,
      flag_reason  TEXT,
      comment      TEXT,
      request_data JSONB,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON ai_feedback(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_feedback_endpoint ON ai_feedback(endpoint);

    CREATE TABLE IF NOT EXISTS ai_results (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL,
      endpoint     VARCHAR(255) NOT NULL,
      request_data JSONB,
      result_data  JSONB,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_results_user_id ON ai_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_results_endpoint ON ai_results(endpoint);
    CREATE INDEX IF NOT EXISTS idx_ai_results_created_at ON ai_results(created_at DESC);
  `);
}

ensureTables().catch(err => console.error('AI tables init error:', err.message));

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// 3-strategy JSON parser (raw → strip fences → first { ... } object)
function parseAIJson(raw) {
  if (!raw || typeof raw !== 'string') return { raw };
  // Strategy 1: raw JSON
  try { return JSON.parse(raw); } catch (_) {}
  // Strategy 2: strip markdown fences
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (_) {}
  // Strategy 3: extract first balanced JSON object
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
  } catch (_) {}
  return { raw };
}

async function saveAIResult(userId, endpoint, requestData, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, request_data, result_data) VALUES ($1, $2, $3, $4)`,
      [userId, endpoint, JSON.stringify(requestData), JSON.stringify(result)]
    );
  } catch (_) {}
}

// POST /api/ai/career-match
// Takes { skills[], interests[] } → matches against 50+ career paths with gap analysis
router.post(
  '/career-match',
  authenticateToken,
  aiRateLimiter,
  [
    body('skills').isArray({ min: 1 }).withMessage('skills must be a non-empty array'),
    body('interests').isArray({ min: 1 }).withMessage('interests must be a non-empty array'),
  ],
  validate,
  async (req, res) => {
    try {
      const { skills, interests } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} Match student profiles to career paths and provide gap analysis. Return JSON:
{
  "career_matches": [
    {
      "career": string,
      "industry": string,
      "match_percentage": number (0-100),
      "match_reasons": [string],
      "skill_gaps": [string],
      "skills_you_have": [string],
      "avg_salary_range": string,
      "growth_outlook": "Excellent"|"Good"|"Fair"|"Limited",
      "education_required": string,
      "time_to_entry_level": string
    }
  ],
  "top_skills_to_develop": [string],
  "recommended_certifications": [string],
  "overall_profile_summary": string
}
Return at least 10 career matches.`,
        },
        {
          role: 'user',
          content: `Match career paths for this student:\n\nSkills: ${skills.join(', ')}\nInterests: ${interests.join(', ')}\n\nProvide matches across diverse industries and career paths.`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'career-match', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/salary-negotiation
// Takes { offer_details, market_data } → negotiation talking points + counter-offer range
router.post(
  '/salary-negotiation',
  authenticateToken,
  aiRateLimiter,
  [
    body('offer_details').notEmpty().withMessage('offer_details is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { offer_details, market_data } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert salary negotiation coach. Provide actionable negotiation strategies and counter-offer ranges. Return JSON:
{
  "assessment": {
    "offer_fairness": "Below Market"|"At Market"|"Above Market",
    "market_context": string,
    "negotiation_potential": "High"|"Medium"|"Low"
  },
  "counter_offer": {
    "minimum_acceptable": number,
    "target": number,
    "stretch_goal": number,
    "currency": string,
    "rationale": string
  },
  "talking_points": [{ "point": string, "script": string, "strength": "Strong"|"Medium"|"Supporting" }],
  "benefits_to_negotiate": [{ "benefit": string, "suggestion": string }],
  "negotiation_script": { "opening": string, "main_ask": string, "backup_ask": string, "closing": string },
  "do_list": [string],
  "dont_list": [string],
  "email_template": string
}`,
        },
        {
          role: 'user',
          content: `Provide salary negotiation guidance:\n\nOffer Details:\n${JSON.stringify(offer_details, null, 2)}\n\nMarket Data:\n${market_data ? JSON.stringify(market_data, null, 2) : 'Not provided'}`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'salary-negotiation', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/scholarship-eligibility
// Takes { student_profile } → predicts scholarship match %, deadline alerts
router.post(
  '/scholarship-eligibility',
  authenticateToken,
  aiRateLimiter,
  [
    body('student_profile').notEmpty().withMessage('student_profile is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { student_profile } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert scholarship advisor. Analyze student profiles and predict scholarship eligibility. Return JSON:
{
  "eligibility_summary": {
    "overall_profile_strength": "Excellent"|"Strong"|"Good"|"Fair",
    "estimated_scholarships_eligible": number,
    "total_potential_funding": string
  },
  "scholarship_matches": [
    {
      "scholarship_name": string,
      "provider": string,
      "match_percentage": number (0-100),
      "award_amount": string,
      "eligibility_criteria_met": [string],
      "eligibility_criteria_missing": [string],
      "deadline_alert": string,
      "application_difficulty": "Easy"|"Moderate"|"Competitive",
      "tips": string
    }
  ],
  "profile_improvements": [{ "area": string, "suggestion": string, "impact": "High"|"Medium"|"Low" }],
  "immediate_actions": [string],
  "deadline_calendar": [{ "scholarship": string, "deadline": string, "urgency": "Urgent"|"Soon"|"Plan Ahead" }]
}`,
        },
        {
          role: 'user',
          content: `Analyze scholarship eligibility for this student:\n\n${JSON.stringify(student_profile, null, 2)}`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'scholarship-eligibility', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/personalized-roadmap
// Takes { target_career, current_level, monthly_hours, timeline_months } → month-by-month plan
router.post(
  '/personalized-roadmap',
  authenticateToken,
  aiRateLimiter,
  [
    body('target_career').trim().notEmpty().withMessage('target_career is required'),
    body('current_level').trim().notEmpty().withMessage('current_level is required'),
    body('timeline_months').isInt({ min: 1, max: 60 }).withMessage('timeline_months must be 1-60'),
  ],
  validate,
  async (req, res) => {
    try {
      const { target_career, current_level, monthly_hours, timeline_months, current_skills } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are an expert learning path designer. Create month-by-month personalized roadmaps with milestones, estimated hours, and resource links. Return JSON:
{
  "overview": { "career_target": string, "total_months": number, "estimated_total_hours": number, "summary": string },
  "monthly_plan": [
    {
      "month": number,
      "focus_theme": string,
      "milestones": [string],
      "topics_to_learn": [string],
      "estimated_hours": number,
      "recommended_resources": [{ "type": "course"|"book"|"video"|"project"|"certification", "title": string, "provider": string, "url": string, "estimated_hours": number }],
      "deliverables": [string],
      "self_assessment_questions": [string]
    }
  ],
  "key_skills_built": [string],
  "certifications_recommended": [{ "name": string, "provider": string, "estimated_prep_weeks": number }],
  "portfolio_projects": [{ "name": string, "description": string, "skills_demonstrated": [string] }],
  "success_metrics": [string],
  "common_pitfalls": [string]
}`,
        },
        {
          role: 'user',
          content: `Build a ${timeline_months}-month personalized learning roadmap.\n\nTarget Career: ${target_career}\nCurrent Level: ${current_level}\nCurrent Skills: ${(current_skills || []).join(', ') || 'Not specified'}\nAvailable Hours/Month: ${monthly_hours || 40}`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'personalized-roadmap', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/peer-mentor-match
// Takes { interests, year_in_school, focus_areas } → peer mentor and study group recommendations
router.post(
  '/peer-mentor-match',
  authenticateToken,
  aiRateLimiter,
  [
    body('interests').isArray({ min: 1 }).withMessage('interests must be a non-empty array'),
  ],
  validate,
  async (req, res) => {
    try {
      const { interests, year_in_school, focus_areas, learning_style } = req.body;

      // Pull existing user profile signals from db (if mentors table exists)
      let mentorPool = [];
      try {
        const r = await pool.query('SELECT id, name, title, expertise, industry, bio FROM mentors LIMIT 50');
        mentorPool = r.rows;
      } catch (_) {}

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You match students with peer mentors and study cohorts. Use mentor pool when available; otherwise suggest archetype profiles. Return JSON:
{
  "matched_peers": [
    {
      "mentor_id": number|null,
      "name": string,
      "background": string,
      "match_score": number (0-100),
      "shared_interests": [string],
      "what_they_can_help_with": [string],
      "suggested_first_topic": string
    }
  ],
  "study_groups": [
    { "topic": string, "size": number, "meeting_cadence": string, "starter_questions": [string] }
  ],
  "success_stories": [
    { "headline": string, "story": string, "lesson": string }
  ],
  "icebreaker_messages": [string],
  "networking_etiquette_tips": [string]
}`,
        },
        {
          role: 'user',
          content: `Match peer mentors and study groups.\n\nInterests: ${interests.join(', ')}\nYear in School: ${year_in_school || 'unspecified'}\nFocus Areas: ${(focus_areas || []).join(', ') || 'general'}\nLearning Style: ${learning_style || 'not specified'}\n\nMentor pool sample (use if relevant):\n${JSON.stringify(mentorPool).slice(0, 4000)}`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'peer-mentor-match', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai/company-culture-fit
// Takes { values, work_style, company_data } → fit assessment with flags
router.post(
  '/company-culture-fit',
  authenticateToken,
  aiRateLimiter,
  [
    body('values').isArray({ min: 1 }).withMessage('values must be a non-empty array'),
    body('company_data').notEmpty().withMessage('company_data is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { values, work_style, deal_breakers, company_data } = req.body;

      const aiResponse = await callOpenRouter([
        {
          role: 'system',
          content: `${CAREER_BOT_SYSTEM} You are a culture-fit analyst. Compare candidate values to company signals and flag risks. Return JSON:
{
  "overall_fit": { "score": number (0-100), "verdict": "Strong Fit"|"Good Fit"|"Mixed"|"Poor Fit", "summary": string },
  "value_alignment": [{ "value": string, "company_signal": string, "alignment": "high"|"medium"|"low", "evidence": string }],
  "work_style_alignment": { "score": number, "notes": string },
  "red_flags": [{ "flag": string, "severity": "high"|"medium"|"low", "ask_in_interview": string }],
  "green_flags": [string],
  "deal_breaker_check": [{ "deal_breaker": string, "violated": boolean, "reasoning": string }],
  "questions_to_ask_interviewer": [string],
  "people_to_meet": [string],
  "recommendation": "pursue"|"pursue_with_caution"|"avoid"
}`,
        },
        {
          role: 'user',
          content: `Assess culture fit.\n\nMy Values: ${values.join(', ')}\nWork Style: ${work_style || 'not specified'}\nDeal Breakers: ${(deal_breakers || []).join(', ') || 'none'}\n\nCompany Data:\n${JSON.stringify(company_data, null, 2)}`,
        },
      ]);

      const result = parseAIJson(aiResponse);
      await saveAIResult(req.user.id, 'company-culture-fit', req.body, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/ai/results - Paginated history of AI runs for the current user
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const endpoint = req.query.endpoint || null;

    const baseWhere = endpoint ? 'WHERE user_id = $1 AND endpoint = $2' : 'WHERE user_id = $1';
    const params = endpoint ? [req.user.id, endpoint] : [req.user.id];

    const countSql = `SELECT COUNT(*) FROM ai_results ${baseWhere}`;
    const countResult = await pool.query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    const dataSql = `SELECT id, endpoint, request_data, result_data, created_at
                     FROM ai_results ${baseWhere}
                     ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const dataResult = await pool.query(dataSql, [...params, limit, offset]);

    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/feedback - Rate AI advice (1-5 stars), flag incorrect advice
router.post(
  '/feedback',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5'),
    body('endpoint').optional().trim(),
    body('flagged').optional().isBoolean().withMessage('flagged must be a boolean'),
    body('flag_reason').optional().trim(),
    body('comment').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const { rating, endpoint, flagged, flag_reason, comment, request_data } = req.body;

      const result = await pool.query(
        `INSERT INTO ai_feedback (user_id, endpoint, rating, flagged, flag_reason, comment, request_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.user.id, endpoint || null, rating, flagged || false, flag_reason || null, comment || null, request_data ? JSON.stringify(request_data) : null]
      );

      res.status(201).json({ message: 'Feedback submitted', feedback: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
