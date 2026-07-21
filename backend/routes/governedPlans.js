'use strict';
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validatePlan, transition } = require('../domain/planningWorkflow');
const router = express.Router();
router.use(authenticateToken);

async function membership(client, tenantId, userId) {
  if (!tenantId) { const e = new Error('x-tenant-id is required'); e.status = 400; throw e; }
  const q = await client.query('SELECT role FROM career_tenant_memberships WHERE tenant_id=$1 AND user_id=$2 AND active=true', [tenantId, userId]);
  if (!q.rows[0]) { const e = new Error('tenant access denied'); e.status = 403; throw e; }
  return q.rows[0].role;
}
const handler = fn => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(e.status || (e.code === '23505' ? 409 : 400)).json({ error: e.message }); } };

router.get('/', handler(async (req, res) => {
  const tenantId = req.header('x-tenant-id'); await membership(pool, tenantId, req.user.id);
  const q = await pool.query('SELECT id,state,version,plan,created_at,updated_at FROM career_plans WHERE tenant_id=$1 ORDER BY updated_at DESC LIMIT 100', [tenantId]); res.json({ plans: q.rows });
}));
router.post('/', handler(async (req, res) => {
  const tenantId = req.header('x-tenant-id'); const key = req.header('idempotency-key'); if (!key) throw new Error('idempotency-key is required');
  const plan = validatePlan(req.body); const client = await pool.connect();
  try { await client.query('BEGIN'); await membership(client, tenantId, req.user.id);
    const q = await client.query(`INSERT INTO career_plans(tenant_id,learner_id,state,plan,idempotency_key,created_by) VALUES($1,$2,'draft',$3,$4,$5) ON CONFLICT(tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`, [tenantId, plan.learnerId, plan, key, req.user.id]);
    await client.query(`INSERT INTO career_plan_events(tenant_id,plan_id,actor_id,event_type,payload) VALUES($1,$2,$3,'created',$4) ON CONFLICT DO NOTHING`, [tenantId,q.rows[0].id,req.user.id,{idempotencyKey:key}]); await client.query('COMMIT'); res.status(201).json(q.rows[0]);
  } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}));
router.post('/:id/transition', handler(async (req,res) => {
  const tenantId=req.header('x-tenant-id'); const client=await pool.connect();
  try { await client.query('BEGIN'); const role=await membership(client,tenantId,req.user.id); const q=await client.query('SELECT * FROM career_plans WHERE id=$1 AND tenant_id=$2 FOR UPDATE',[req.params.id,tenantId]); if(!q.rows[0]) { const e=new Error('plan not found');e.status=404;throw e; }
    const row=q.rows[0]; if(Number(req.body.version)!==row.version) { const e=new Error('version conflict');e.status=409;throw e; } const next=transition(row.state,req.body.state,role,row.plan,req.body.note);
    const updated=await client.query('UPDATE career_plans SET state=$1,version=version+1,updated_at=NOW() WHERE id=$2 RETURNING *',[next,row.id]); await client.query('INSERT INTO career_plan_events(tenant_id,plan_id,actor_id,event_type,payload) VALUES($1,$2,$3,$4,$5)',[tenantId,row.id,req.user.id,'transition',{from:row.state,to:next,note:req.body.note||null}]);
    await client.query('COMMIT');res.json(updated.rows[0]);
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));
router.post('/:id/sync-requests', handler(async(req,res)=>{
  const tenantId=req.header('x-tenant-id');const role=await membership(pool,tenantId,req.user.id);if(!['counselor','integration_admin','tenant_admin'].includes(role)){const e=new Error('integration role required');e.status=403;throw e;} const provider=String(req.body.provider||'');if(!['sis','lms','occupation_catalog','course_catalog','opportunity_feed','calendar'].includes(provider)) throw new Error('unsupported provider');
  const q=await pool.query(`INSERT INTO career_sync_requests(tenant_id,plan_id,provider,status,requested_by,payload) VALUES($1,$2,$3,'pending',$4,$5) RETURNING *`,[tenantId,req.params.id,provider,req.user.id,req.body.payload||{}]);res.status(202).json(q.rows[0]);
}));
module.exports=router;
