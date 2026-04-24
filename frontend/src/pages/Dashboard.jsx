import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { path: '/career-paths', icon: '🎯', title: 'Career Paths', desc: 'Explore AI-recommended career paths tailored to your interests and skills', color: '#667eea' },
  { path: '/skills', icon: '⚡', title: 'Skills Gap Analysis', desc: 'Identify skill gaps and get personalized learning recommendations', color: '#f093fb' },
  { path: '/courses', icon: '📚', title: 'Course Recommendations', desc: 'Discover top courses from leading platforms to build your skills', color: '#4facfe' },
  { path: '/job-trends', icon: '📊', title: 'Job Market Trends', desc: 'Stay updated with real-time job market data and growth predictions', color: '#43e97b' },
  { path: '/interview-prep', icon: '🎤', title: 'Interview Prep', desc: 'Practice with AI-generated interview questions and expert tips', color: '#fa709a' },
  { path: '/mentors', icon: '🤝', title: 'Mentorship', desc: 'Connect with industry mentors who can guide your career journey', color: '#a18cd1' },
  { path: '/scholarships', icon: '🎓', title: 'Scholarships', desc: 'Find scholarships and funding opportunities for your education', color: '#fccb90' },
  { path: '/networking-events', icon: '🌐', title: 'Networking Events', desc: 'Discover conferences, hackathons, and networking opportunities', color: '#96fbc4' },
  { path: '/resumes', icon: '📄', title: 'Resume Builder', desc: 'Build professional resumes with AI-powered suggestions', color: '#f5576c' },
  { path: '/portfolios', icon: '💼', title: 'Portfolio Builder', desc: 'Create impressive portfolios with guided project suggestions', color: '#4facfe' },
  { path: '/learning-roadmaps', icon: '🗺️', title: 'Learning Roadmaps', desc: 'Follow structured learning paths to reach your career goals', color: '#667eea' },
  { path: '/industry-insights', icon: '🏭', title: 'Industry Insights', desc: 'Deep-dive into industry trends, challenges, and opportunities', color: '#f093fb' },
  { path: '/salary-insights', icon: '💰', title: 'Salary Insights', desc: 'Compare salaries across roles, industries, and locations', color: '#43e97b' },
  { path: '/assessments', icon: '📋', title: 'Career Assessment', desc: 'Take AI-powered assessments to discover your ideal career', color: '#fa709a' },
  { path: '/career-chat', icon: '🤖', title: 'AI Career Chat', desc: 'Chat with our AI career counselor for personalized guidance', color: '#a18cd1' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome to CareerPath AI</h1>
          <p>Your intelligent career guidance platform. Explore the tools below to plan your future.</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">15+</span>
            <span className="stat-label">AI-Powered Tools</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100+</span>
            <span className="stat-label">Career Paths</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">24/7</span>
            <span className="stat-label">AI Counselor</span>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        {features.map((feature) => (
          <Link key={feature.path} to={feature.path} className="feature-card">
            <div className="feature-card-accent" style={{ background: feature.color }}></div>
            <div className="feature-card-content">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
            <div className="feature-card-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
