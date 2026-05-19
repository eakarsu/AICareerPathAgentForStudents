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
  careerMatch: (payload) => api.post('/ai/career-match', payload),
  salaryNegotiation: (payload) => api.post('/ai/salary-negotiation', payload),
  scholarshipEligibility: (payload) => api.post('/ai/scholarship-eligibility', payload),
  personalizedRoadmap: (payload) => api.post('/ai/personalized-roadmap', payload),
  peerMentorMatch: (payload) => api.post('/ai/peer-mentor-match', payload),
  companyCultureFit: (payload) => api.post('/ai/company-culture-fit', payload),
  results: (page = 1, limit = 20, endpoint) => api.get('/ai/results', { params: { page, limit, endpoint } }),
  feedback: (payload) => api.post('/ai/feedback', payload),
};

// ---- Conversations ----
export const conversationsApi = {
  list: (page = 1, limit = 20) => api.get(`/conversations?page=${page}&limit=${limit}`),
  create: (payload) => api.post('/conversations', payload),
  getMessages: (id, page = 1, limit = 50) => api.get(`/conversations/${id}/messages?page=${page}&limit=${limit}`),
  addMessage: (id, payload) => api.post(`/conversations/${id}/messages`, payload),
  delete: (id) => api.delete(`/conversations/${id}`),
};

// ---- Resumes (extended AI) ----
export const resumesApi = {
  enhance: (id, payload) => api.post(`/resumes/${id}/enhance`, payload),
  generateBullets: (payload) => api.post('/resumes/bullet-generator', payload),
};

// ---- Interview prep (extended AI) ----
export const interviewApi = {
  generateQuestions: (payload) => api.post('/interview-prep/generate-questions', payload),
  evaluateAnswer: (payload) => api.post('/interview-prep/evaluate-answer', payload),
};

// ---- Mentors (matching) ----
export const mentorsApi = {
  match: (interests, skills) => api.get(`/mentors/match?interests=${encodeURIComponent(interests || '')}&skills=${encodeURIComponent(skills || '')}`),
  aiMatch: (payload) => api.post('/mentors/ai-match', payload),
};

// ---- Learning Roadmaps ----
export const roadmapsApi = {
  aiGenerate: (payload) => api.post('/learning-roadmaps/ai-generate', payload),
};

// ---- Career Chat ----
export const chatApi = {
  send: (payload) => api.post('/career-chat', payload),
};

export default api;
