const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const states = ['scheduled','in_progress','peer_review','verified'];

router.use(authenticateToken);
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_simulation_portfolios ORDER BY scheduled_at,id LIMIT 100');
    res.json({ data: result.rows });
  } catch (error) { res.status(500).json({ error: 'Unable to load work simulations' }); }
});
router.get('/summary', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*)::int AS simulations, COUNT(*) FILTER (WHERE status='verified')::int AS verified,
      ROUND(AVG((communication_score+collaboration_score+creativity_score+critical_thinking_score+leadership_score)/5.0),1) AS average_score
      FROM work_simulation_portfolios`);
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Unable to summarize simulations' }); }
});
router.post('/', async (req, res) => {
  const { candidateName, simulationType, employerScenario } = req.body || {};
  if (![candidateName,simulationType,employerScenario].every((v)=>String(v||'').trim())) return res.status(422).json({ error: 'candidateName, simulationType, and employerScenario are required' });
  try {
    const ref = `SIM-${Date.now()}`;
    const result = await pool.query(`INSERT INTO work_simulation_portfolios
      (simulation_ref,candidate_name,simulation_type,employer_scenario,communication_score,collaboration_score,creativity_score,critical_thinking_score,leadership_score,evidence,reviewer_notes,status,scheduled_at)
      VALUES($1,$2,$3,$4,0,0,0,0,0,'[]'::jsonb,'Awaiting assessed evidence','scheduled',NOW()+INTERVAL '7 days') RETURNING *`,
      [ref,candidateName.trim(),simulationType.trim(),employerScenario.trim()]);
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Unable to schedule simulation' }); }
});
router.post('/:id/advance', async (req, res) => {
  try {
    const current = await pool.query('SELECT * FROM work_simulation_portfolios WHERE id=$1',[req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Simulation not found' });
    const next = states[Math.min(states.indexOf(current.rows[0].status)+1,states.length-1)];
    const result = await pool.query('UPDATE work_simulation_portfolios SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[next,req.params.id]);
    res.json({ data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Unable to advance simulation' }); }
});
module.exports = router;
