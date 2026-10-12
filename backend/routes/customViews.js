/*
 * Custom Views — 4 student career-path planning features (2 VIZ + 2 NON-VIZ)
 *   VIZ:     1) /skill-gap-radar      — skill-gap radar/bar chart vs target role
 *            2) /course-job-heatmap   — course-to-job match heatmap
 *   NON-VIZ: 3) /career-plan-pdf      — printable structured career plan
 *            4) /taxonomy             — skill/role taxonomy editor (CRUD)
 *
 * Charts and printable plans use explicit local formulas and templates.
 * Taxonomy configuration is persisted per authenticated native user.
 */
const express = require('express');
const router = express.Router();

const {authenticateToken:authMiddleware}=require('../middleware/auth');
const pool=require('../config/database');
const {loadTaxonomy,projectRow}=require('../lib/careerTaxonomy');
const {randomUUID}=require('node:crypto');
// ---------- helpers ----------
function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
function uniq(arr) { return Array.from(new Set((arr || []).filter(Boolean))); }

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

async function ownedRole(req){
 const {roles}=await loadTaxonomy(pool,req.user.id);
 const role=req.body?.targetRole?roles.find(row=>row.id===req.body.targetRole):roles[0];
 if(!role){const error=new Error('Select an available role from your saved taxonomy.');error.status=422;throw error;}
 return role;
}
function failed(res,error){res.status(error.status||503).json({error:error.status?error.message:'Career view could not be loaded or saved. Retry.'});}
// ============================================================
// 1) VIZ — Skill-gap radar / bar
//    POST /api/custom-views/skill-gap-radar
//    body: { targetRole, currentSkills: { [name]: 0..5 } }
// ============================================================
router.post('/skill-gap-radar', authMiddleware, async (req, res) => {
  try {
    const { targetRole, currentSkills = {} } = req.body || {};
    const role = await ownedRole(req);
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
        : 'Your self-ratings are higher; verify skills before making career decisions.',
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    failed(res,err);
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
    const taxonomy = await loadTaxonomy(pool,req.user.id);
    const reqRoles = (req.body && req.body.roles) || taxonomy.roles.map(r => r.id);
    const courses = COURSE_CATALOG.filter(c => reqCourses.includes(c.id));
    const roles = taxonomy.roles.filter(r => reqRoles.includes(r.id));

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
    failed(res,err);
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
    const role = await ownedRole(req);

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
    failed(res,err);
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
router.get('/taxonomy',authMiddleware,async(req,res)=>{
 try{res.json({feature:'taxonomy',...await loadTaxonomy(pool,req.user.id),generated_at:new Date().toISOString()});}catch(error){failed(res,error);}
});
const validKind=(req,res,next)=>{if(!['role','skill'].includes(req.params.type||req.body?.type))return res.status(400).json({error:'type must be role or skill.'});next();};
function values(req){
 const kind=req.params.type||req.body.type,body=req.body||{},allowed=kind==='role'?['type','title','skills']:['type','name'];
 if(Object.keys(body).some(key=>!allowed.includes(key))){const error=new Error('Only native taxonomy configuration fields can be edited.');error.status=400;throw error;}
 const title=kind==='role'?body.title:body.name;
 if(typeof title!=='string'||!title.trim()||title.length>200){const error=new Error('Enter a name of up to 200 characters.');error.status=422;throw error;}
 const skills=kind==='role'?body.skills:[];
 if(!Array.isArray(skills)||skills.length>50||skills.some(skill=>typeof skill!=='string'||!skill.trim()||skill.length>100)||(kind==='role'&&!skills.length)){const error=new Error('Roles need 1–50 named skills.');error.status=422;throw error;}
 return{kind,title:title.trim(),skills:uniq(skills.map(skill=>skill.trim()))};
}
router.get('/taxonomy/:type/:id',authMiddleware,validKind,async(req,res)=>{
 try{const row=(await pool.query('SELECT * FROM career_taxonomy_entries WHERE user_id=$1 AND kind=$2 AND key=$3',[req.user.id,req.params.type,req.params.id])).rows[0];if(!row)return res.status(404).json({error:'Taxonomy item not found.'});res.json({feature:'taxonomy',item:projectRow(row)});}catch(error){failed(res,error);}
});
router.post('/taxonomy',authMiddleware,validKind,async(req,res)=>{
 try{const {kind,title,skills}=values(req),key=kind+'_'+randomUUID();const row=(await pool.query('INSERT INTO career_taxonomy_entries(user_id,kind,key,title,skills) VALUES($1,$2,$3,$4,$5) RETURNING *',[req.user.id,kind,key,title,JSON.stringify(skills)])).rows[0];res.status(201).json({feature:'taxonomy',created:projectRow(row)});}catch(error){failed(res,error);}
});
router.put('/taxonomy/:type/:id',authMiddleware,validKind,async(req,res)=>{
 try{const {kind,title,skills}=values(req);const row=(await pool.query('UPDATE career_taxonomy_entries SET title=$1,skills=$2,updated_at=NOW() WHERE user_id=$3 AND kind=$4 AND key=$5 RETURNING *',[title,JSON.stringify(skills),req.user.id,kind,req.params.id])).rows[0];if(!row)return res.status(404).json({error:'Taxonomy item not found.'});res.json({feature:'taxonomy',updated:projectRow(row)});}catch(error){failed(res,error);}
});
router.delete('/taxonomy/:type/:id',authMiddleware,validKind,async(req,res)=>{
 try{const row=(await pool.query('DELETE FROM career_taxonomy_entries WHERE user_id=$1 AND kind=$2 AND key=$3 RETURNING key',[req.user.id,req.params.type,req.params.id])).rows[0];if(!row)return res.status(404).json({error:'Taxonomy item not found.'});res.json({feature:'taxonomy',deleted:true});}catch(error){failed(res,error);}
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
