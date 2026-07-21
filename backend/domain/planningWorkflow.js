'use strict';

const STATES = Object.freeze({ draft: ['submitted'], submitted: ['approved', 'changes_requested'], changes_requested: ['submitted'], approved: ['active'], active: ['completed', 'paused'], paused: ['active'], completed: [] });
const COUNSELOR_ROLES = new Set(['counselor', 'tenant_admin']);

function requireText(value, field, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${field} is required and must be at most ${max} characters`);
  return value.trim();
}

function validatePlan(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('plan must be an object');
  const goals = Array.isArray(input.goals) ? input.goals : [];
  const skills = Array.isArray(input.verifiedSkills) ? input.verifiedSkills : [];
  const coursework = Array.isArray(input.coursework) ? input.coursework : [];
  if (!goals.length) throw new Error('at least one learner goal is required');
  if (!skills.length || skills.some(s => !s || !s.source || !s.verifiedAt)) throw new Error('verifiedSkills require source and verifiedAt evidence');
  if (!coursework.length || coursework.some(c => !c || !c.sourceSystem || !c.externalId)) throw new Error('coursework requires sourceSystem and externalId');
  return {
    learnerId: requireText(input.learnerId, 'learnerId', 100),
    goals: goals.map((g, i) => ({ title: requireText(g.title, `goals[${i}].title`, 200), targetDate: g.targetDate || null })),
    verifiedSkills: skills,
    coursework,
    opportunities: Array.isArray(input.opportunities) ? input.opportunities : [],
    evidenceSources: Array.isArray(input.evidenceSources) ? input.evidenceSources : [],
    consent: { student: input.consent?.student === true, guardian: input.consent?.guardian === true, capturedAt: input.consent?.capturedAt || null },
  };
}

function transition(current, next, role, plan, approvalNote) {
  if (!STATES[current]?.includes(next)) throw new Error(`transition ${current} -> ${next} is not allowed`);
  if (next === 'submitted' && !plan.consent.student) throw new Error('student consent is required before counselor review');
  if (['approved', 'changes_requested'].includes(next) && !COUNSELOR_ROLES.has(role)) throw new Error('counselor approval is required');
  if (next === 'approved' && (!approvalNote || approvalNote.trim().length < 10)) throw new Error('approval evidence note is required');
  return next;
}

module.exports = { STATES, validatePlan, transition };
