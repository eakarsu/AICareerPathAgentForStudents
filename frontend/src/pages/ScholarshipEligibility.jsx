import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function ScholarshipEligibility() {
  return (
    <AIFeatureForm
      title="Scholarship Eligibility Predictor"
      icon="🎓"
      description="Predict scholarship match %, deadline alerts, and improvement suggestions."
      endpoint="/ai/scholarship-eligibility"
      fields={[
        { key: 'student_profile', label: 'Student Profile (JSON)', type: 'array_json', required: true,
          rows: 8,
          placeholder: '{ "gpa": 3.7, "field_of_study": "Computer Science", "year": "Junior", "ethnicity": "Hispanic", "location": "Texas", "extracurriculars": ["Robotics Club", "Math Tutor"], "income_bracket": "low_income", "first_generation": true, "essays": "Strong writing samples" }',
          help: 'Provide profile as JSON to get a personalized match analysis.' },
      ]}
      onSubmit={async (data) => (await aiApi.scholarshipEligibility(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>Scholarship Matches</span></div>
            <h3 className="ai-response-title">Eligibility Analysis</h3>
          </div>
          <div className="ai-response-body">
            {r.eligibility_summary && (
              <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, marginBottom: 16 }}>
                <strong>Profile Strength:</strong> {r.eligibility_summary.overall_profile_strength} •
                Eligible Scholarships: {r.eligibility_summary.estimated_scholarships_eligible} •
                Total Funding Potential: {r.eligibility_summary.total_potential_funding}
              </div>
            )}
            {r.scholarship_matches?.length > 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                {r.scholarship_matches.map((s, i) => (
                  <div key={i} style={{ padding: 16, background: '#1f2937', borderRadius: 12, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0 }}>{s.scholarship_name}</h4>
                      <span style={{ background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: 12 }}>{s.match_percentage}%</span>
                    </div>
                    <p style={{ color: '#94a3b8', margin: '4px 0' }}>{s.provider} • {s.award_amount}</p>
                    <p><strong>Deadline:</strong> {s.deadline_alert} • Difficulty: {s.application_difficulty}</p>
                    {s.eligibility_criteria_met?.length > 0 && (
                      <p><strong>You meet:</strong> {s.eligibility_criteria_met.join(', ')}</p>
                    )}
                    {s.eligibility_criteria_missing?.length > 0 && (
                      <p style={{ color: '#fca5a5' }}><strong>Missing:</strong> {s.eligibility_criteria_missing.join(', ')}</p>
                    )}
                    {s.tips && <p style={{ color: '#cbd5e1' }}>💡 {s.tips}</p>}
                  </div>
                ))}
              </div>
            )}
            {r.deadline_calendar?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>📅 Deadline Calendar</h4>
                <ul>
                  {r.deadline_calendar.map((d, i) => (
                    <li key={i}><strong>{d.scholarship}</strong> — {d.deadline} ({d.urgency})</li>
                  ))}
                </ul>
              </div>
            )}
            {r.immediate_actions?.length > 0 && (
              <div>
                <h4>🚀 Immediate Actions</h4>
                <ul>{r.immediate_actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
