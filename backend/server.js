const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
