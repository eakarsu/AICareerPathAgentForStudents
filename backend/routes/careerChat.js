const express = require('express');
const { callOpenRouter } = require('../config/openrouter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    const aiResponse = await callOpenRouter([
      { role: 'system', content: `You are CareerBot, an expert AI career counselor for students. You provide personalized, empathetic, and actionable career guidance. You have deep knowledge of:
- Career paths across all industries
- Educational requirements and programs
- Job market trends and salary data
- Interview preparation and resume building
- Networking strategies and professional development
- Scholarship and funding opportunities

Be encouraging, specific, and practical in your advice. Format responses with clear structure using headers, bullet points, and emphasis where helpful. Always tailor advice to the student's specific situation.${context ? '\n\nContext: ' + context : ''}` },
      { role: 'user', content: message }
    ]);
    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
