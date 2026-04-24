import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const { data } = await axios.post(endpoint, payload);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail('demo@student.com');
    setPassword('demo123');
    setIsRegister(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="login-logo">🚀</span>
            <h1>CareerPath AI</h1>
            <p>Your AI-Powered Career Guidance Platform</p>
          </div>
          <div className="login-features">
            <div className="login-feature">
              <span>🎯</span>
              <div>
                <h3>Personalized Career Paths</h3>
                <p>AI-driven recommendations tailored to your unique profile</p>
              </div>
            </div>
            <div className="login-feature">
              <span>📊</span>
              <div>
                <h3>Real-Time Market Insights</h3>
                <p>Stay ahead with current job trends and salary data</p>
              </div>
            </div>
            <div className="login-feature">
              <span>🤖</span>
              <div>
                <h3>AI Career Counselor</h3>
                <p>Get expert guidance from our AI assistant 24/7</p>
              </div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-card">
            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="login-subtitle">
              {isRegister ? 'Start your career journey today' : 'Sign in to continue your journey'}
            </p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <button className="btn btn-demo" onClick={fillDemo}>
              🔑 Fill Demo Credentials
            </button>
            <div className="login-switch">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
