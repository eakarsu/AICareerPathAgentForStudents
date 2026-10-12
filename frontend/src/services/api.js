import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ---- New AI features ----
export const aiApi = {
  careerMatch: (payload, config) => api.post('/ai/career-match', payload, config),
  salaryNegotiation: (payload, config) => api.post('/ai/salary-negotiation', payload, config),
  scholarshipEligibility: (payload, config) => api.post('/ai/scholarship-eligibility', payload, config),
  personalizedRoadmap: (payload, config) => api.post('/ai/personalized-roadmap', payload, config),
  peerMentorMatch: (payload, config) => api.post('/ai/peer-mentor-match', payload, config),
  companyCultureFit: (payload, config) => api.post('/ai/company-culture-fit', payload, config),
  results: (page = 1, limit = 20, endpoint) => api.get('/ai/results', { params: { page, limit, endpoint } }),
  feedback: (payload, config) => api.post('/ai/feedback', payload, config),
};

// ---- Conversations ----
export const conversationsApi = {
  list: (page = 1, limit = 20) => api.get(`/conversations?page=${page}&limit=${limit}`),
  create: (payload, config) => api.post('/conversations', payload, config),
  getMessages: (id, page = 1, limit = 50) => api.get(`/conversations/${id}/messages?page=${page}&limit=${limit}`),
  addMessage: (id, payload) => api.post(`/conversations/${id}/messages`, payload, config),
  delete: (id) => api.delete(`/conversations/${id}`),
};

// ---- Resumes (extended AI) ----
export const resumesApi = {
  enhance: (id, payload) => api.post(`/resumes/${id}/enhance`, payload, config),
  generateBullets: (payload, config) => api.post('/resumes/bullet-generator', payload, config),
};

// ---- Interview prep (extended AI) ----
export const interviewApi = {
  generateQuestions: (payload, config) => api.post('/interview-prep/generate-questions', payload, config),
  evaluateAnswer: (payload, config) => api.post('/interview-prep/evaluate-answer', payload, config),
};

// ---- Mentors (matching) ----
export const mentorsApi = {
  match: (interests, skills) => api.get(`/mentors/match?interests=${encodeURIComponent(interests || '')}&skills=${encodeURIComponent(skills || '')}`),
  aiMatch: (payload, config) => api.post('/mentors/ai-match', payload, config),
};

// ---- Learning Roadmaps ----
export const roadmapsApi = {
  aiGenerate: (payload, config) => api.post('/learning-roadmaps/ai-generate', payload, config),
};

// ---- Career Chat ----
export const chatApi = {
  send: (payload, config) => api.post('/career-chat', payload, config),
};

export default api;
