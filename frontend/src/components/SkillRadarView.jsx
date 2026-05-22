import React, { useState } from 'react';
import api from '../services/api';

// VIZ #1: Skill-gap radar/bar chart vs target role.
// Pure inline SVG -> no extra deps.
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

export default function SkillRadarView() {
  const [role, setRole] = useState('sde');
  const [currentSkills, setCurrentSkills] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.post('/custom-views/skill-gap-radar', { targetRole: role, currentSkills });
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Radar polygon points.
  const radar = (axes, key) => {
    const cx = 200, cy = 200, R = 140;
    return axes.map((a, i) => {
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      const r = R * (a[key] || 0);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  };

  return (
    <div style={card} data-testid="skill-gap-radar">
      <h3 style={h3}>Skill Gap — Radar + Bar</h3>
      <p style={muted}>VIZ — radar shows current vs target, bars rank the biggest gaps.</p>
      <div style={row}>
        <label style={lbl}>Target role
          <select value={role} onChange={e => { setRole(e.target.value); setData(null); setCurrentSkills({}); }} style={inp}>
            {ROLE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <button onClick={run} disabled={loading} style={btn}>{loading ? 'Calculating…' : 'Compute Skill Gap'}</button>
      </div>

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginTop: 12 }}>
            {data.axes.map((a) => (
              <label key={a.skill} style={lbl}>
                {a.skill} ({Math.round((Number(currentSkills[a.skill]) || 0))}/5)
                <input
                  type="range" min="0" max="5" step="1"
                  value={Number(currentSkills[a.skill]) || 0}
                  onChange={e => setCurrentSkills({ ...currentSkills, [a.skill]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
            {/* Radar */}
            <svg viewBox="0 0 400 400" style={{ width: '100%', background: '#0f172a', borderRadius: 12 }}>
              {[0.25, 0.5, 0.75, 1.0].map((g, i) => (
                <circle key={i} cx="200" cy="200" r={140 * g} fill="none" stroke="#334155" />
              ))}
              {data.axes.map((a, i) => {
                const angle = (Math.PI * 2 * i) / data.axes.length - Math.PI / 2;
                const x = 200 + 160 * Math.cos(angle);
                const y = 200 + 160 * Math.sin(angle);
                return (
                  <g key={i}>
                    <line x1="200" y1="200" x2={200 + 140 * Math.cos(angle)} y2={200 + 140 * Math.sin(angle)} stroke="#334155" />
                    <text x={x} y={y} fill="#94a3b8" fontSize="10" textAnchor="middle">{a.skill}</text>
                  </g>
                );
              })}
              <polygon points={radar(data.axes, 'target')} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.5" />
              <polygon points={radar(data.axes, 'current')} fill="rgba(16,185,129,0.35)" stroke="#10b981" strokeWidth="2" />
            </svg>

            {/* Gap bars */}
            <div>
              <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>Gap per skill (lower = closer to ready)</div>
              {data.axes.map(a => (
                <div key={a.skill} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
                    <span>{a.skill}</span><span>{Math.round(a.gap * 100)}%</span>
                  </div>
                  <div style={{ background: '#0f172a', height: 10, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(a.gap * 100)}%`, background: '#ef4444', height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: 13 }}>
            Overall readiness: <strong>{Math.round((data.overallReadiness || 0) * 100)}%</strong> — {data.recommendation}
          </div>
        </>
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
const inp = { padding: 8, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9' };
const btn = { padding: '8px 16px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' };
const errBox = { marginTop: 10, padding: 10, background: '#7f1d1d', color: '#fee2e2', borderRadius: 8 };
