import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function CareerChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m CareerBot, your AI career counselor. I can help you with:\n\n- **Career path exploration** - Find careers that match your interests\n- **Skills development** - Identify what skills to learn\n- **Interview preparation** - Practice for your dream job\n- **Resume tips** - Make your application stand out\n- **Industry insights** - Understand market trends\n- **Salary negotiation** - Know your worth\n\nWhat would you like to explore today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/api/career-chat', {
        message: userMessage,
        context: messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    'What career suits someone who loves both coding and creativity?',
    'How do I prepare for a tech interview?',
    'What are the highest-paying entry-level tech jobs?',
    'How can I build a strong portfolio as a student?',
    'What skills should I learn for AI/ML careers?',
    'How do I negotiate my first salary offer?',
  ];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <span className="chat-header-icon">🤖</span>
        <div>
          <h1>AI Career Counselor</h1>
          <p>Powered by AI - Get personalized career guidance instantly</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <AIResponseDisplay content={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="quick-prompts">
            <p className="quick-prompts-label">Try asking:</p>
            <div className="quick-prompts-grid">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="quick-prompt-btn"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your career..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
