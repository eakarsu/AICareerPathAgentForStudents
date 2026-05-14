import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function SalaryNegotiation() {
  return (
    <AIFeatureForm
      title="Salary Negotiation Coach"
      icon="💼"
      description="Get a counter-offer range, talking points, and email scripts for salary negotiation."
      endpoint="/ai/salary-negotiation"
      fields={[
        { key: 'offer_details', label: 'Offer Details (JSON)', type: 'array_json', required: true,
          rows: 6,
          placeholder: '{ "role": "Software Engineer", "base": 95000, "bonus": 10000, "equity": "1000 RSUs", "location": "Austin, TX", "yoe": 2 }',
          help: 'Provide the complete offer as JSON.' },
        { key: 'market_data', label: 'Market Data (JSON, optional)', type: 'array_json',
          rows: 4,
          placeholder: '{ "p25": 85000, "p50": 105000, "p75": 125000, "source": "levels.fyi" }' },
      ]}
      onSubmit={async (data) => (await aiApi.salaryNegotiation(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>Negotiation Plan</span></div>
            <h3 className="ai-response-title">Your Negotiation Strategy</h3>
          </div>
          <div className="ai-response-body">
            {r.assessment && (
              <div style={{ padding: 12, background: '#0f172a', borderRadius: 8, marginBottom: 12 }}>
                <strong>Offer Fairness:</strong> {r.assessment.offer_fairness} • Potential: {r.assessment.negotiation_potential}
                <p style={{ marginTop: 8, color: '#94a3b8' }}>{r.assessment.market_context}</p>
              </div>
            )}
            {r.counter_offer && (
              <div style={{ padding: 16, background: '#1e293b', borderRadius: 12, marginBottom: 16 }}>
                <h4>Counter-Offer Range ({r.counter_offer.currency || 'USD'})</h4>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div><strong>Floor:</strong> {r.counter_offer.minimum_acceptable?.toLocaleString()}</div>
                  <div><strong>Target:</strong> {r.counter_offer.target?.toLocaleString()}</div>
                  <div><strong>Stretch:</strong> {r.counter_offer.stretch_goal?.toLocaleString()}</div>
                </div>
                <p style={{ marginTop: 8, color: '#cbd5e1' }}>{r.counter_offer.rationale}</p>
              </div>
            )}
            {r.talking_points?.length > 0 && (
              <div>
                <h4>Talking Points</h4>
                {r.talking_points.map((t, i) => (
                  <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '8px 0' }}>
                    <strong>{t.point}</strong> <span style={{ fontSize: 12, color: '#94a3b8' }}>({t.strength})</span>
                    <p style={{ marginTop: 4, color: '#cbd5e1' }}>"{t.script}"</p>
                  </div>
                ))}
              </div>
            )}
            {r.email_template && (
              <div style={{ marginTop: 16 }}>
                <h4>Email Template</h4>
                <pre style={{ background: '#0f172a', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>{r.email_template}</pre>
              </div>
            )}
            {r.do_list?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>✅ Do</h4>
                <ul>{r.do_list.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {r.dont_list?.length > 0 && (
              <div>
                <h4>❌ Don't</h4>
                <ul>{r.dont_list.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
