import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CareerPaths from './pages/CareerPaths';
import Skills from './pages/Skills';
import Courses from './pages/Courses';
import JobTrends from './pages/JobTrends';
import InterviewPrep from './pages/InterviewPrep';
import Mentors from './pages/Mentors';
import Scholarships from './pages/Scholarships';
import NetworkingEvents from './pages/NetworkingEvents';
import Resumes from './pages/Resumes';
import Portfolios from './pages/Portfolios';
import LearningRoadmaps from './pages/LearningRoadmaps';
import IndustryInsights from './pages/IndustryInsights';
import SalaryInsights from './pages/SalaryInsights';
import Assessments from './pages/Assessments';
import CareerChat from './pages/CareerChat';
import CareerMatch from './pages/CareerMatch';
import SalaryNegotiation from './pages/SalaryNegotiation';
import ScholarshipEligibility from './pages/ScholarshipEligibility';
import PersonalizedRoadmap from './pages/PersonalizedRoadmap';
import PeerMentorMatch from './pages/PeerMentorMatch';
import CompanyCultureFit from './pages/CompanyCultureFit';
import InterviewMock from './pages/InterviewMock';
import ResumeBullets from './pages/ResumeBullets';
import AIHistory from './pages/AIHistory';
import Webhooks from './pages/Webhooks';
import CustomViewsPage from './pages/CustomViewsPage';
import Layout from './components/Layout';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';
import ApplicationDeadlineRisk from './pages/ApplicationDeadlineRisk';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (userData, tokenData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/career-paths" element={<CareerPaths />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/job-trends" element={<JobTrends />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/networking-events" element={<NetworkingEvents />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/portfolios" element={<Portfolios />} />
        <Route path="/learning-roadmaps" element={<LearningRoadmaps />} />
        <Route path="/industry-insights" element={<IndustryInsights />} />
        <Route path="/salary-insights" element={<SalaryInsights />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/career-chat" element={<CareerChat />} />
        <Route path="/career-match" element={<CareerMatch />} />
        <Route path="/salary-negotiation" element={<SalaryNegotiation />} />
        <Route path="/scholarship-eligibility" element={<ScholarshipEligibility />} />
        <Route path="/personalized-roadmap" element={<PersonalizedRoadmap />} />
        <Route path="/peer-mentor-match" element={<PeerMentorMatch />} />
        <Route path="/company-culture-fit" element={<CompanyCultureFit />} />
        <Route path="/interview-mock" element={<InterviewMock />} />
        <Route path="/resume-bullets" element={<ResumeBullets />} />
        <Route path="/ai-history" element={<AIHistory />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/custom-views" element={<CustomViewsPage />} />
        <Route path="/application-deadline-risk" element={<ApplicationDeadlineRisk />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
