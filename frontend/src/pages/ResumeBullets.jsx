import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { resumesApi } from '../services/api';

export default function ResumeBullets() {
  return (
    <AIFeatureForm
      title="Resume Bullet Generator"
      icon="✍️"
      description="Generate impact-focused, quantified bullet points using the STAR method."
      endpoint="/resumes/bullet-generator"
      fields={[
        { key: 'job_description', label: 'Target Job Description', type: 'textarea', required: true, rows: 5 },
        { key: 'experience', label: 'Your Experience to Transform', type: 'textarea', required: true, rows: 6,
          placeholder: 'Describe what you did in plain language; the AI will sharpen it into bullets.' },
      ]}
      onSubmit={async (data) => (await resumesApi.generateBullets(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-body">
            {r.bullets?.length > 0 && r.bullets.map((b, i) => (
              <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '6px 0' }}>
                <strong style={{ color: '#10b981' }}>•</strong> {b.bullet}
                <p style={{ color: '#94a3b8', marginTop: 4 }}>
                  Impact: {b.impact_level} • Keywords: {(b.keywords_used || []).join(', ')}
                </p>
              </div>
            ))}
            {r.tips?.length > 0 && (
              <div><h4>Tips</h4><ul>{r.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
            {r.action_verbs_used?.length > 0 && (
              <p><strong>Verbs used:</strong> {r.action_verbs_used.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}
