const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });
require('./config/runtime').validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // disabled to allow inline styles in dev/prod build
  crossOriginEmbedderPolicy: false,
}));

// Env-driven CORS allow-list (comma-separated origins). Fallback to permissive in dev.
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/career-paths', require('./routes/careerPaths'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/job-trends', require('./routes/jobTrends'));
app.use('/api/interview-prep', require('./routes/interviewPrep'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/networking-events', require('./routes/networkingEvents'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/learning-roadmaps', require('./routes/learningRoadmaps'));
app.use('/api/industry-insights', require('./routes/industryInsights'));
app.use('/api/salary-insights', require('./routes/salaryInsights'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/career-chat', require('./routes/careerChat'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/ai', require('./routes/aiNew'));
app.use('/api/webhooks', require('./routes/webhooks'));
// Apply pass 5 — backlog (notifications, job/learning integrations, exports)
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/export', require('./routes/exportData'));
app.use('/api/governed-plans', require('./routes/governedPlans'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/agentic-coach', require('./routes/agenticCareerCoach')); // apply pass 6 — audit custom suggestion

app.use('/api/bls-labor-rag', require('./routes/blsLaborRag')); // apply pass 6 — audit custom suggestion

app.use('/api/labor-trend-alerts', require('./routes/laborTrendAlerts')); // apply pass 6 — audit custom suggestion

app.use('/api/district-white-label', require('./routes/districtWhiteLabel')); // apply pass 6 — audit custom suggestion

// Custom Views — 4 student career-path planning features (2 viz + 2 non-viz)
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/application-deadline-risk', require('./routes/applicationDeadlineRisk'));
app.use('/api/work-simulations', require('./routes/workSimulations'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
