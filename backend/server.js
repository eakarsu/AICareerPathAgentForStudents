const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/agentic-coach', require('./routes/agenticCareerCoach')); // apply pass 6 — audit custom suggestion

app.use('/api/bls-labor-rag', require('./routes/blsLaborRag')); // apply pass 6 — audit custom suggestion

app.use('/api/labor-trend-alerts', require('./routes/laborTrendAlerts')); // apply pass 6 — audit custom suggestion

app.use('/api/district-white-label', require('./routes/districtWhiteLabel')); // apply pass 6 — audit custom suggestion
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


// === Batch 01 Gaps & Frontend Mounts ===
app.use('/api/gap-ainew-js-scaffold-but-0-mounted-chat-style-ai-endp', require('./routes/gap_ainew_js_scaffold_but_0_mounted_chat_style_ai_endp'));
app.use('/api/gap-no-ai-personalized-career-path-generator-behind-th', require('./routes/gap_no_ai_personalized_career_path_generator_behind_th'));
app.use('/api/gap-no-ai-resume-cover-letter-generator-pages-exist-bu', require('./routes/gap_no_ai_resume_cover_letter_generator_pages_exist_bu'));
app.use('/api/gap-no-live-ai-mock-interview-only-static-interviewpre', require('./routes/gap_no_live_ai_mock_interview_only_static_interviewpre'));
app.use('/api/gap-no-ai-salary-negotiation-simulator-backing-the-pag', require('./routes/gap_no_ai_salary_negotiation_simulator_backing_the_pag'));
app.use('/api/gap-no-notification-system-delivery-channel-for-nudges', require('./routes/gap_no_notification_system_delivery_channel_for_nudges'));
app.use('/api/gap-no-sis-api-client-powerschool-infinite-campus-beyo', require('./routes/gap_no_sis_api_client_powerschool_infinite_campus_beyo'));
app.use('/api/gap-no-direct-internship-job-board-feed-integration', require('./routes/gap_no_direct_internship_job_board_feed_integration'));
app.use('/api/gap-no-college-application-linkage-common-app-fafsa', require('./routes/gap_no_college_application_linkage_common_app_fafsa'));
app.use('/api/gap-no-parent-counselor-portal', require('./routes/gap_no_parent_counselor_portal'));
