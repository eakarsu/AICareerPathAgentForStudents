const express = require('express');
const router = express.Router();

router.post('/score', (req, res) => {
  const applications = Array.isArray(req.body?.applications) ? req.body.applications : [
    { school: 'State University', due_in_days: 12, essays_done: 1, essays_total: 3, fafsa_done: false, recommendation_done: true },
    { school: 'Metro Tech', due_in_days: 28, essays_done: 2, essays_total: 2, fafsa_done: true, recommendation_done: false },
  ];
  const rows = applications.map((app) => {
    const due = Number(app.due_in_days ?? 30);
    const essaysTotal = Math.max(1, Number(app.essays_total ?? 1));
    const essayGap = essaysTotal - Number(app.essays_done ?? 0);
    const score = Math.min(100, Math.round(Math.max(0, 35 - due) * 2 + essayGap * 18 + (app.fafsa_done ? 0 : 20) + (app.recommendation_done ? 0 : 14)));
    return {
      school: app.school || 'Application',
      score,
      tier: score >= 70 ? 'urgent' : score >= 40 ? 'at_risk' : 'on_track',
      action: score >= 40 ? 'Schedule counselor check-in and prioritize missing documents this week.' : 'Keep current application cadence.',
    };
  }).sort((a, b) => b.score - a.score);
  res.json({ urgentCount: rows.filter((row) => row.tier === 'urgent').length, applications: rows });
});

module.exports = router;
