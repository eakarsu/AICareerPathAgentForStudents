const express = require('express');
const pool = require('../config/database');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const CAREER_BOT_SYSTEM = `You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance with deep knowledge of job market trends and educational pathways.

You have deep knowledge of:
- Career paths across all industries
- Educational requirements and programs
- Job market trends and salary data
- Interview preparation and resume building
- Networking strategies and professional development
- Scholarship and funding opportunities

Be encouraging, specific, and practical in your advice. Format responses with clear structure using headers, bullet points, and emphasis where helpful. Always tailor advice to the student's specific situation.`;

router.post('/', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { message, context, conversation_id } = req.body;

    if (!message || !message.trim()) {
      return res.status(422).json({ error: 'message is required' });
    }

    const systemContent = context
      ? `${CAREER_BOT_SYSTEM}\n\nContext: ${context}`
      : CAREER_BOT_SYSTEM;

    const aiResponse = await callOpenRouter([
      { role: 'system', content: systemContent },
      { role: 'user', content: message }
    ]);

    // Persist messages to DB if conversation_id is provided
    if (conversation_id) {
      try {
        // Verify conversation belongs to user
        const convCheck = await pool.query(
          'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
          [conversation_id, req.user.id]
        );
        if (convCheck.rows.length > 0) {
          await pool.query(
            'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
            [conversation_id, 'user', message]
          );
          await pool.query(
            'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
            [conversation_id, 'assistant', aiResponse]
          );
          await pool.query(
            'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
            [conversation_id]
          );
        }
      } catch (dbErr) {
        // DB persistence failure should not break the AI response
        console.error('Message persistence error:', dbErr.message);
      }
    }

    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
