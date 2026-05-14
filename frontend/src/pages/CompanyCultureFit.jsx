import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function CompanyCultureFit() {
  return (
    <AIFeatureForm
      title="Company Culture Fit"
      icon="🏢"
      description="Compare your values against company signals; get red flags + green flags."
      endpoint="/ai/company-culture-fit"
      fields={[
        { key: 'values', label: 'Your Core Values', type: 'tags', required: true, placeholder: 'autonomy, learning, mentorship, work-life balance' },
        { key: 'work_style', label: 'Work Style', type: 'select', options: ['Highly collaborative', 'Independent + async', 'Hybrid', 'In-office'] },
        { key: 'deal_breakers', label: 'Deal Breakers', type: 'tags', placeholder: 'mandatory overtime, no remote' },
        { key: 'company_data', label: 'Company Data (JSON)', type: 'array_json', required: true,
          rows: 8,
          placeholder: '{ "name": "Acme Co", "size": "200-500", "values_page": "...", "glassdoor_themes": ["fast-paced", "siloed"], "interview_signals": ["panel asked about late nights"], "benefits": ["unlimited PTO"], "leadership": "founder-led" }' },
      ]}
      onSubmit={async (data) => (await aiApi.companyCultureFit(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>Culture Fit</span></div>
            <h3 className="ai-response-title">Fit Assessment</h3>
          </div>
          <div className="ai-response-body">
            {r.overall_fit && (
              <div style={{ padding: 16, background: '#0f172a', borderRadius: 12, marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Overall Fit: {r.overall_fit.verdict} ({r.overall_fit.score}/100)</h4>
                <p style={{ color: '#cbd5e1', marginTop: 8 }}>{r.overall_fit.summary}</p>
                <p><strong>Recommendation:</strong> {r.recommendation}</p>
              </div>
            )}
            {r.value_alignment?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>Value Alignment</h4>
                {r.value_alignment.map((v, i) => (
                  <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '6px 0' }}>
                    <strong>{v.value}</strong> — <span style={{ color: v.alignment === 'high' ? '#10b981' : v.alignment === 'low' ? '#ef4444' : '#f59e0b' }}>{v.alignment}</span>
                    <p style={{ color: '#94a3b8' }}>Signal: {v.company_signal}</p>
                    <p><small>{v.evidence}</small></p>
                  </div>
                ))}
              </div>
            )}
            {r.red_flags?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>🚩 Red Flags</h4>
                {r.red_flags.map((f, i) => (
                  <div key={i} style={{ padding: 10, background: '#7f1d1d', borderRadius: 8, margin: '6px 0', color: '#fff' }}>
                    <strong>{f.flag}</strong> ({f.severity})
                    <p>Ask in interview: "{f.ask_in_interview}"</p>
                  </div>
                ))}
              </div>
            )}
            {r.green_flags?.length > 0 && (
              <div>
                <h4>✅ Green Flags</h4>
                <ul>{r.green_flags.map((g, i) => <li key={i}>{g}</li>)}</ul>
              </div>
            )}
            {r.questions_to_ask_interviewer?.length > 0 && (
              <div>
                <h4>❓ Questions to Ask</h4>
                <ul>{r.questions_to_ask_interviewer.map((q, i) => <li key={i}>{q}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
