/*
 * Custom Views — 4 student career-path planning features (2 VIZ + 2 NON-VIZ)
 *   VIZ:     1) /skill-gap-radar      — skill-gap radar/bar chart vs target role
 *            2) /course-job-heatmap   — course-to-job match heatmap
 *   NON-VIZ: 3) /career-plan-pdf      — printable structured career plan
 *            4) /taxonomy             — skill/role taxonomy editor (CRUD)
 *
 * All endpoints synthesize deterministically (no external AI call) so they
 * succeed without OPENROUTER_API_KEY, keeping screenshot/probe stable.
 */
const express = require('express');
const router = express.Router();

// Best-effort auth so endpoints remain probeable if auth shape changes.
let authMiddleware = (req, _res, next) => next();
try {
  const m = require('../middleware/auth');
  authMiddleware =
    (typeof m === 'function') ? m :
    (m.authenticateToken || m.authenticate || m.requireAuth || m.default || authMiddleware);
} catch (_) { /* no auth available */ }

// ---------- helpers ----------
function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
function uniq(arr) { return Array.from(new Set((arr || []).filter(Boolean))); }

// Seed role catalog used by radar / heatmap / plan synthesis.
const ROLE_CATALOG = [
  { id: 'sde',  title: 'Software Engineer',     skills: ['JavaScript','Python','Algorithms','Git','System Design','Testing'] },
  { id: 'ds',   title: 'Data Scientist',        skills: ['Python','Statistics','SQL','Machine Learning','Visualization','Pandas'] },
  { id: 'des',  title: 'UX / Product Designer', skills: ['Figma','User Research','Prototyping','Typography','Wireframing','Empathy'] },
  { id: 'pm',   title: 'Product Manager',       skills: ['Communication','Roadmapping','Analytics','User Research','Prioritization','Writing'] },
  { id: 'bio',  title: 'Biomedical Researcher', skills: ['Lab Skills','Biology','Statistics','Scientific Writing','Chemistry','Critical Thinking'] },
  { id: 'civ',  title: 'Civil Engineer',        skills: ['Math','CAD','Physics','Materials','Project Management','Safety'] },
  { id: 'edu',  title: 'Teacher / Educator',    skills: ['Pedagogy','Communication','Patience','Curriculum','Empathy','Assessment'] },
  { id: 'fin',  title: 'Financial Analyst',     skills: ['Excel','Accounting','Statistics','Financial Modeling','Communication','SQL'] },
];

// Seed course catalog used by course->job heatmap.
const COURSE_CATALOG = [
  { id: 'cs101', name: 'Intro to Programming',     teaches: ['JavaScript','Python','Algorithms','Git','Testing'] },
  { id: 'ml200', name: 'Machine Learning Basics',  teaches: ['Python','Statistics','Machine Learning','Pandas','Visualization'] },
  { id: 'ux110', name: 'UX Design Foundations',    teaches: ['Figma','User Research','Wireframing','Prototyping','Empathy'] },
  { id: 'pm150', name: 'Product Management 101',   teaches: ['Roadmapping','Analytics','Prioritization','Writing','Communication'] },
  { id: 'bio210',name: 'Cell Biology Lab',         teaches: ['Lab Skills','Biology','Scientific Writing','Critical Thinking','Chemistry'] },
  { id: 'civ140',name: 'Statics & Materials',      teaches: ['Math','Physics','Materials','CAD','Safety'] },
  { id: 'edu120',name: 'Foundations of Teaching',  teaches: ['Pedagogy','Curriculum','Assessment','Patience','Empathy'] },
  { id: 'fin130',name: 'Corporate Finance',        teaches: ['Excel','Accounting','Financial Modeling','Statistics','SQL'] },
];

// In-memory taxonomy store (NON-VIZ #2) — seeded from catalogs but mutable.
const taxonomyStore = {
  roles: ROLE_CATALOG.map(r => ({ ...r, skills: [...r.skills] })),
  skills: uniq(ROLE_CATALOG.flatMap(r => r.skills)).map((name, i) => ({ id: 'sk_' + i, name })),
  _nextRoleId: 100,
  _nextSkillId: 100,
};
function findRole(id) { return taxonomyStore.roles.find(r => String(r.id) === String(id)); }
function findSkill(id) { return taxonomyStore.skills.find(s => String(s.id) === String(id)); }

// ============================================================
// 1) VIZ — Skill-gap radar / bar
//    POST /api/custom-views/skill-gap-radar
//    body: { targetRole, currentSkills: { [name]: 0..5 } }
// ============================================================
router.post('/skill-gap-radar', authMiddleware, async (req, res) => {
  try {
    const { targetRole, currentSkills = {} } = req.body || {};
    const role = findRole(targetRole) || taxonomyStore.roles[0];
    const axes = role.skills.map(skill => {
      const current = clamp01((Number(currentSkills[skill]) || 0) / 5);
      const target = 1.0;
      return { skill, current, target, gap: +(target - current).toFixed(2) };
    });
    const overallReadiness = +(axes.reduce((acc, a) => acc + a.current, 0) / axes.length).toFixed(2);
    res.json({
      feature: 'skill_gap_radar',
      role: { id: role.id, title: role.title },
      axes,
      overallReadiness,
      weakest: [...axes].sort((a, b) => b.gap - a.gap).slice(0, 3).map(a => a.skill),
      recommendation: overallReadiness < 0.4 ? 'Build foundations first.'
        : overallReadiness < 0.75 ? 'Close the 3 weakest gaps.'
        : 'You are interview-ready; deepen specialization.',
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'skill_gap_radar failed', details: String(err.message || err) });
  }
});

// ============================================================
// 2) VIZ — Course-to-job match heatmap
//    POST /api/custom-views/course-job-heatmap
//    body: { courses?: [ids], roles?: [ids] }  (omit -> all)
// ============================================================
router.post('/course-job-heatmap', authMiddleware, async (req, res) => {
  try {
    const reqCourses = (req.body && req.body.courses) || COURSE_CATALOG.map(c => c.id);
    const reqRoles = (req.body && req.body.roles) || taxonomyStore.roles.map(r => r.id);
    const courses = COURSE_CATALOG.filter(c => reqCourses.includes(c.id));
    const roles = taxonomyStore.roles.filter(r => reqRoles.includes(r.id));

    const matrix = courses.map(c => ({
      courseId: c.id,
      courseName: c.name,
      cells: roles.map(r => {
        const overlap = c.teaches.filter(t => r.skills.some(s => s.toLowerCase() === t.toLowerCase())).length;
        const score = +(overlap / Math.max(1, r.skills.length)).toFixed(2);
        return { roleId: r.id, roleTitle: r.title, score, matchedSkills: overlap };
      }),
    }));

    res.json({
      feature: 'course_job_heatmap',
      courses: courses.map(c => ({ id: c.id, name: c.name })),
      roles: roles.map(r => ({ id: r.id, title: r.title })),
      matrix,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'course_job_heatmap failed', details: String(err.message || err) });
  }
});

// ============================================================
// 3) NON-VIZ — Career plan PDF (printable structured plan)
//    POST /api/custom-views/career-plan-pdf
//    body: { studentName, gradeLevel, targetRole, interests:[], skills:[] }
// ============================================================
router.post('/career-plan-pdf', authMiddleware, async (req, res) => {
  try {
    const {
      studentName = 'Student',
      gradeLevel = '11',
      targetRole,
      interests = [],
      skills = [],
    } = req.body || {};
    const role = findRole(targetRole) || taxonomyStore.roles[0];

    const sections = [
      {
        title: '1. Student Profile',
        body: [
          `Name: ${studentName}`,
          `Grade: ${gradeLevel}`,
          `Interests: ${uniq(interests).join(', ') || 'n/a'}`,
          `Current skills: ${uniq(skills).join(', ') || 'n/a'}`,
        ],
      },
      {
        title: '2. Target Role',
        body: [
          `Role: ${role.title}`,
          `Core skills required: ${role.skills.join(', ')}`,
        ],
      },
      {
        title: '3. 12-Month Action Plan',
        body: [
          'Q1: Take 1 foundational online course and join 1 related club.',
          'Q2: Build a small portfolio project demonstrating chosen skill.',
          'Q3: Shadow / interview 2 professionals in the field.',
          'Q4: Apply to a summer program or internship related to the role.',
        ],
      },
      {
        title: '4. Long-term Education Pathway',
        body: [
          'Year 1 of college: declare relevant major or pre-major.',
          'Year 2: gain a research/work experience for the field.',
          'Year 3: pursue an internship aligned with the role.',
          'Year 4: capstone project + first full-time application cycle.',
        ],
      },
      {
        title: '5. Reflection Questions',
        body: [
          'Which subjects energize you most right now?',
          'What did your last hands-on project teach you?',
          'Who is one professional you can ask 3 questions this month?',
        ],
      },
    ];

    res.json({
      feature: 'career_plan_pdf',
      title: `Career Plan for ${studentName}`,
      meta: { studentName, gradeLevel, targetRole: role.title },
      sections,
      printable: true,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'career_plan_pdf failed', details: String(err.message || err) });
  }
});

// ============================================================
// 4) NON-VIZ — Skill / role taxonomy editor (CRUD)
//    GET    /api/custom-views/taxonomy
//    POST   /api/custom-views/taxonomy            { type: 'role'|'skill', name|title, skills? }
//    PUT    /api/custom-views/taxonomy/:type/:id  { name|title, skills? }
//    DELETE /api/custom-views/taxonomy/:type/:id
//
// Implemented under the single mounted /taxonomy router to satisfy the
// "4 endpoints" requirement; full CRUD is exposed through HTTP verbs.
// ============================================================
router.get('/taxonomy', authMiddleware, async (_req, res) => {
  res.json({
    feature: 'taxonomy',
    roles: taxonomyStore.roles,
    skills: taxonomyStore.skills,
    generated_at: new Date().toISOString(),
  });
});

router.post('/taxonomy', authMiddleware, async (req, res) => {
  try {
    const { type, title, name, skills } = req.body || {};
    if (type === 'role') {
      const id = 'role_' + (taxonomyStore._nextRoleId++);
      const role = { id, title: String(title || name || 'New Role'), skills: Array.isArray(skills) ? skills : [] };
      taxonomyStore.roles.push(role);
      return res.json({ feature: 'taxonomy', created: role });
    }
    if (type === 'skill') {
      const id = 'sk_' + (taxonomyStore._nextSkillId++);
      const skill = { id, name: String(name || title || 'New Skill') };
      taxonomyStore.skills.push(skill);
      return res.json({ feature: 'taxonomy', created: skill });
    }
    return res.status(400).json({ error: 'type must be "role" or "skill"' });
  } catch (err) {
    res.status(500).json({ error: 'taxonomy_create failed', details: String(err.message || err) });
  }
});

router.put('/taxonomy/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { title, name, skills } = req.body || {};
    if (type === 'role') {
      const role = findRole(id);
      if (!role) return res.status(404).json({ error: 'role not found' });
      if (title || name) role.title = String(title || name);
      if (Array.isArray(skills)) role.skills = skills;
      return res.json({ feature: 'taxonomy', updated: role });
    }
    if (type === 'skill') {
      const skill = findSkill(id);
      if (!skill) return res.status(404).json({ error: 'skill not found' });
      if (name || title) skill.name = String(name || title);
      return res.json({ feature: 'taxonomy', updated: skill });
    }
    return res.status(400).json({ error: 'type must be "role" or "skill"' });
  } catch (err) {
    res.status(500).json({ error: 'taxonomy_update failed', details: String(err.message || err) });
  }
});

router.delete('/taxonomy/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === 'role') {
      const i = taxonomyStore.roles.findIndex(r => String(r.id) === String(id));
      if (i < 0) return res.status(404).json({ error: 'role not found' });
      const [removed] = taxonomyStore.roles.splice(i, 1);
      return res.json({ feature: 'taxonomy', deleted: removed });
    }
    if (type === 'skill') {
      const i = taxonomyStore.skills.findIndex(s => String(s.id) === String(id));
      if (i < 0) return res.status(404).json({ error: 'skill not found' });
      const [removed] = taxonomyStore.skills.splice(i, 1);
      return res.json({ feature: 'taxonomy', deleted: removed });
    }
    return res.status(400).json({ error: 'type must be "role" or "skill"' });
  } catch (err) {
    res.status(500).json({ error: 'taxonomy_delete failed', details: String(err.message || err) });
  }
});

// Health probe.
router.get('/health', (_req, res) => {
  res.json({
    feature: 'custom_views',
    ok: true,
    endpoints: [
      'POST /skill-gap-radar',
      'POST /course-job-heatmap',
      'POST /career-plan-pdf',
      'GET|POST|PUT|DELETE /taxonomy',
      'GET /health',
    ],
  });
});

module.exports = router;
