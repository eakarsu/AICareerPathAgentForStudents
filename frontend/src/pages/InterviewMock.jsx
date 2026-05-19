import React, { useState } from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { interviewApi } from '../services/api';

export default function InterviewMock() {
  const [step, setStep] = useState('generate'); // 'generate' | 'evaluate'

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${step === 'generate' ? 'btn-primary' : ''}`} onClick={() => setStep('generate')}>1. Generate Questions</button>
        <button className={`btn ${step === 'evaluate' ? 'btn-primary' : ''}`} onClick={() => setStep('evaluate')}>2. Evaluate Answer</button>
      </div>

      {step === 'generate' ? (
        <AIFeatureForm
          title="Mock Interview — Question Generator"
          icon="🎤"
          description="Get 10 tailored interview questions with what interviewers look for and tips."
          endpoint="/interview-prep/generate-questions"
          fields={[
            { key: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Backend Engineer' },
            { key: 'experience_level', label: 'Experience Level', type: 'select', required: true, options: ['Intern', 'New Graduate', 'Junior', 'Mid', 'Senior'] },
          ]}
          onSubmit={async (data) => (await interviewApi.generateQuestions(data)).data}
          renderResult={(r) => (
            <div className="ai-response-container">
              <div className="ai-response-body">
                {r.questions?.map((q, i) => (
                  <div key={i} style={{ padding: 12, background: '#1f2937', borderRadius: 12, margin: '8px 0' }}>
                    <strong>Q{q.id || i + 1}: {q.question}</strong>
                    <p style={{ color: '#94a3b8' }}>{q.category} • {q.difficulty}</p>
                    <p>🎯 {q.what_interviewers_look_for}</p>
                    <p><strong>Structure:</strong> {q.sample_answer_structure}</p>
                    {q.tips?.length > 0 && (
                      <ul>{q.tips.map((t, j) => <li key={j}>{t}</li>)}</ul>
                    )}
                  </div>
                ))}
                {r.preparation_tips?.length > 0 && (
                  <div><h4>Preparation Tips</h4>
                    <ul>{r.preparation_tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {r.common_mistakes?.length > 0 && (
                  <div><h4>Common Mistakes</h4>
                    <ul>{r.common_mistakes.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      ) : (
        <AIFeatureForm
          title="Mock Interview — Answer Evaluation"
          icon="📝"
          description="Score your answer for delivery, clarity, content with STAR breakdown."
          endpoint="/interview-prep/evaluate-answer"
          fields={[
            { key: 'question', label: 'Interview Question', type: 'textarea', rows: 2, required: true },
            { key: 'answer', label: 'Your Answer', type: 'textarea', rows: 6, required: true },
            { key: 'job_title', label: 'Job Title (optional)', type: 'text' },
          ]}
          onSubmit={async (data) => (await interviewApi.evaluateAnswer(data)).data}
          renderResult={(r) => (
            <div className="ai-response-container">
              <div className="ai-response-body">
                {r.overall_score !== undefined && (
                  <div style={{ padding: 16, background: '#0f172a', borderRadius: 12 }}>
                    <h3>Overall: {r.overall_score}/100 — {r.grade}</h3>
                  </div>
                )}
                {['delivery', 'clarity', 'content'].map((k) => r[k] && (
                  <div key={k} style={{ padding: 12, background: '#1f2937', borderRadius: 8, margin: '8px 0' }}>
                    <strong>{k.charAt(0).toUpperCase() + k.slice(1)}: {r[k].score}/100</strong>
                    <p>{r[k].feedback}</p>
                    {r[k].tips?.length > 0 && <ul>{r[k].tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
                    {r[k].missing_elements?.length > 0 && <p>Missing: {r[k].missing_elements.join(', ')}</p>}
                    {r[k].strong_points?.length > 0 && <p>Strong: {r[k].strong_points.join(', ')}</p>}
                  </div>
                ))}
                {r.improved_answer_example && (
                  <div style={{ marginTop: 12 }}>
                    <h4>Improved Example</h4>
                    <pre style={{ background: '#0f172a', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>{r.improved_answer_example}</pre>
                  </div>
                )}
                {r.star_method_breakdown && (
                  <div>
                    <h4>STAR Breakdown</h4>
                    {Object.entries(r.star_method_breakdown).map(([k, v]) => (
                      <p key={k}><strong>{k}:</strong> {v}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
