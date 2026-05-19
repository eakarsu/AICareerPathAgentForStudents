import React, { useState } from 'react';
import AIResponseDisplay from './AIResponseDisplay';
import FeedbackWidget from './FeedbackWidget';

/**
 * Reusable form for AI features with structured/unstructured response display.
 *
 * Props:
 * - title, icon, description
 * - fields: [{ key, label, type, placeholder, options, required, multi }]
 *   type: text | textarea | select | number | tags (comma list) | array
 * - onSubmit: async (formData) => responseObject
 * - endpoint: string label for feedback widget
 * - renderResult: optional custom (result) => JSX
 */
export default function AIFeatureForm({
  title,
  icon,
  description,
  fields,
  onSubmit,
  endpoint,
  renderResult,
}) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Process fields: convert tags type comma string -> array
      const payload = { ...formData };
      fields.forEach((f) => {
        if (f.type === 'tags' && typeof payload[f.key] === 'string') {
          payload[f.key] = payload[f.key].split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (f.type === 'array_json' && typeof payload[f.key] === 'string') {
          try { payload[f.key] = JSON.parse(payload[f.key]); } catch { /* leave as string */ }
        }
      });
      const data = await onSubmit(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <span className="page-icon">{icon}</span>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
      </div>

      <div className="ai-panel" style={{ marginTop: 16 }}>
        <div className="ai-panel-body">
          <form onSubmit={handleSubmit}>
            {fields.map((f) => (
              <div className="form-group" key={f.key}>
                <label>{f.label}{f.required && ' *'}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={f.rows || 3}
                    value={formData[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={formData[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'tags' ? (
                  <input
                    type="text"
                    value={formData[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || 'comma-separated values'}
                    required={f.required}
                  />
                ) : f.type === 'array_json' ? (
                  <textarea
                    rows={f.rows || 4}
                    value={formData[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || '[{ ... }]'}
                    required={f.required}
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={formData[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                )}
                {f.help && <small style={{ color: '#94a3b8' }}>{f.help}</small>}
              </div>
            ))}

            <button className="btn btn-ai" type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-dots">Generating<span>.</span><span>.</span><span>.</span></span>
              ) : (
                `🤖 Run AI ${title}`
              )}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 16, borderRadius: 12, margin: '20px 0' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 24 }}>
            {renderResult ? renderResult(result) : (
              <AIResponseDisplay
                content={typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                title={`AI ${title}`}
              />
            )}
            {endpoint && (
              <FeedbackWidget endpoint={endpoint} requestData={formData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
