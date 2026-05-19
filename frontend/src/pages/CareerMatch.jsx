import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function CareerMatch() {
  return (
    <AIFeatureForm
      title="Career Compatibility Matcher"
      icon="🎯"
      description="Match your skills + interests to 10+ career paths with detailed gap analysis."
      endpoint="/ai/career-match"
      fields={[
        { key: 'skills', label: 'Your Skills', type: 'tags', required: true, placeholder: 'e.g. Python, React, Communication, Data Analysis', help: 'Comma-separated list' },
        { key: 'interests', label: 'Your Interests', type: 'tags', required: true, placeholder: 'e.g. Machine Learning, Healthcare, Sustainability', help: 'Comma-separated list' },
      ]}
      onSubmit={async (data) => (await aiApi.careerMatch(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>AI-Powered Matches</span></div>
            <h3 className="ai-response-title">Top Career Matches</h3>
          </div>
          <div className="ai-response-body">
            {r.overall_profile_summary && <p><strong>Profile Summary:</strong> {r.overall_profile_summary}</p>}

            {r.career_matches && (
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {r.career_matches.map((m, i) => (
                  <div key={i} style={{ padding: 16, background: '#1f2937', borderRadius: 12, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#f1f5f9' }}>{m.career}</h4>
                      <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 13 }}>
                        {m.match_percentage}% match
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', marginTop: 4 }}>
                      {m.industry} • {m.education_required} • {m.time_to_entry_level}
                    </p>
                    <p style={{ color: '#cbd5e1', fontSize: 14 }}>💰 {m.avg_salary_range} • Outlook: {m.growth_outlook}</p>
                    {m.match_reasons?.length > 0 && (
                      <div><strong>Why it fits:</strong>
                        <ul>{m.match_reasons.map((r, j) => <li key={j}>{r}</li>)}</ul>
                      </div>
                    )}
                    {m.skills_you_have?.length > 0 && (
                      <p><strong>Skills you have:</strong> {m.skills_you_have.join(', ')}</p>
                    )}
                    {m.skill_gaps?.length > 0 && (
                      <p><strong>Skill gaps to close:</strong> {m.skill_gaps.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {r.top_skills_to_develop?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Top Skills to Develop</h4>
                <ul>{r.top_skills_to_develop.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {r.recommended_certifications?.length > 0 && (
              <div>
                <h4>Recommended Certifications</h4>
                <ul>{r.recommended_certifications.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
