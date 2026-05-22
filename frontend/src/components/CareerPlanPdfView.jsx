import React, { useState } from 'react';
import api from '../services/api';

// NON-VIZ #1: Career plan PDF (printable structured plan).
// Posts to /custom-views/career-plan-pdf and renders a print-friendly view.
const ROLE_OPTIONS = [
  { id: 'sde', label: 'Software Engineer' },
  { id: 'ds',  label: 'Data Scientist' },
  { id: 'des', label: 'UX / Product Designer' },
  { id: 'pm',  label: 'Product Manager' },
  { id: 'bio', label: 'Biomedical Researcher' },
  { id: 'civ', label: 'Civil Engineer' },
  { id: 'edu', label: 'Teacher / Educator' },
  { id: 'fin', label: 'Financial Analyst' },
];

export default function CareerPlanPdfView() {
  const [studentName, setStudentName] = useState('Demo Student');
  const [gradeLevel, setGradeLevel] = useState('11');
  const [targetRole, setTargetRole] = useState('sde');
  const [interests, setInterests] = useState('coding, math, building things');
  const [skills, setSkills] = useState('Python, Git, Communication');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.post('/custom-views/career-plan-pdf', {
        studentName,
        gradeLevel,
        targetRole,
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const doPrint = () => { window.print(); };

  return (
    <div style={card} data-testid="career-plan-pdf">
      <h3 style={h3}>Career Plan (Printable PDF)</h3>
      <p style={muted}>NON-VIZ — generate a structured career plan and Print to PDF.</p>
      <div style={row}>
        <label style={lbl}>Student name<input style={inp} value={studentName} onChange={e => setStudentName(e.target.value)} /></label>
        <label style={lbl}>Grade<input style={inp} value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} /></label>
        <label style={lbl}>Target role
          <select style={inp} value={targetRole} onChange={e => setTargetRole(e.target.value)}>
            {ROLE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <label style={lbl}>Interests<input style={inp} value={interests} onChange={e => setInterests(e.target.value)} /></label>
        <label style={lbl}>Skills<input style={inp} value={skills} onChange={e => setSkills(e.target.value)} /></label>
        <button onClick={run} disabled={loading} style={btn}>{loading ? 'Generating…' : 'Generate Plan'}</button>
        {data && <button onClick={doPrint} style={{ ...btn, background: '#10b981' }}>Print / Save PDF</button>}
      </div>

      {data && (
        <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, marginTop: 12 }}>
          <h2 style={{ color: '#f1f5f9', margin: '0 0 8px 0' }}>{data.title}</h2>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
            Grade {data.meta.gradeLevel} • Target: {data.meta.targetRole}
          </div>
          {data.sections.map(sec => (
            <div key={sec.title} style={{ marginBottom: 10 }}>
              <h4 style={{ color: '#cbd5e1', margin: '0 0 4px 0' }}>{sec.title}</h4>
              <ul style={{ margin: 0, color: '#e2e8f0', fontSize: 13 }}>
                {sec.body.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {err && <div style={errBox}>Error: {err}</div>}
    </div>
  );
}

const card = { background: '#1f2937', padding: 16, borderRadius: 12, border: '1px solid #334155', marginBottom: 16, color: '#f1f5f9' };
const h3 = { margin: '0 0 6px 0', color: '#f1f5f9' };
const muted = { color: '#94a3b8', marginTop: 0, fontSize: 13 };
const row = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' };
const lbl = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#cbd5e1' };
const inp = { padding: 8, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', minWidth: 140 };
const btn = { padding: '8px 16px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' };
const errBox = { marginTop: 10, padding: 10, background: '#7f1d1d', color: '#fee2e2', borderRadius: 8 };
