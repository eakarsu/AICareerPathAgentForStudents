import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function PersonalizedRoadmap() {
  return (
    <AIFeatureForm
      title="Personalized Learning Path"
      icon="🗺️"
      description="Generate a month-by-month roadmap with milestones, resources, and projects."
      endpoint="/ai/personalized-roadmap"
      fields={[
        { key: 'target_career', label: 'Target Career', type: 'text', required: true, placeholder: 'e.g. Machine Learning Engineer' },
        { key: 'current_level', label: 'Current Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
        { key: 'timeline_months', label: 'Timeline (months)', type: 'number', required: true, placeholder: '6' },
        { key: 'monthly_hours', label: 'Available Hours/Month', type: 'number', placeholder: '40' },
        { key: 'current_skills', label: 'Current Skills', type: 'tags', placeholder: 'Python, Statistics, SQL' },
      ]}
      onSubmit={async (data) => (await aiApi.personalizedRoadmap(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>Roadmap</span></div>
            <h3 className="ai-response-title">Your Learning Plan</h3>
          </div>
          <div className="ai-response-body">
            {r.overview && (
              <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, marginBottom: 16 }}>
                <h4>{r.overview.career_target}</h4>
                <p>📅 {r.overview.total_months} months • ⏱ {r.overview.estimated_total_hours} hours total</p>
                <p style={{ color: '#cbd5e1' }}>{r.overview.summary}</p>
              </div>
            )}
            {r.monthly_plan?.length > 0 && r.monthly_plan.map((m, i) => (
              <div key={i} style={{ padding: 16, background: '#1f2937', borderRadius: 12, marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Month {m.month}: {m.focus_theme}</h4>
                <p style={{ color: '#94a3b8' }}>{m.estimated_hours} hours</p>
                {m.milestones?.length > 0 && (
                  <div><strong>Milestones:</strong>
                    <ul>{m.milestones.map((ms, j) => <li key={j}>{ms}</li>)}</ul>
                  </div>
                )}
                {m.topics_to_learn?.length > 0 && (
                  <p><strong>Topics:</strong> {m.topics_to_learn.join(', ')}</p>
                )}
                {m.recommended_resources?.length > 0 && (
                  <div><strong>Resources:</strong>
                    <ul>{m.recommended_resources.map((rs, j) => (
                      <li key={j}>{rs.type}: {rs.title} ({rs.provider}) — {rs.estimated_hours}h
                        {rs.url && <a href={rs.url} target="_blank" rel="noreferrer"> [link]</a>}
                      </li>
                    ))}</ul>
                  </div>
                )}
                {m.deliverables?.length > 0 && (
                  <p><strong>Deliverables:</strong> {m.deliverables.join(', ')}</p>
                )}
              </div>
            ))}
            {r.portfolio_projects?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>💼 Portfolio Projects</h4>
                {r.portfolio_projects.map((p, i) => (
                  <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '6px 0' }}>
                    <strong>{p.name}</strong>
                    <p style={{ color: '#cbd5e1' }}>{p.description}</p>
                    <small>Skills: {(p.skills_demonstrated || []).join(', ')}</small>
                  </div>
                ))}
              </div>
            )}
            {r.certifications_recommended?.length > 0 && (
              <div>
                <h4>🏆 Recommended Certifications</h4>
                <ul>{r.certifications_recommended.map((c, i) => (
                  <li key={i}>{c.name} ({c.provider}) — ~{c.estimated_prep_weeks} weeks</li>
                ))}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
