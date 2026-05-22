import React, { useEffect, useState } from 'react';
import api from '../services/api';

// VIZ #2: Course-to-job match heatmap.
// Rows = courses, Cols = roles, cell color = overlap score 0..1.
// Filename kept (CareerDecisionTreeView) for stable imports; semantics replaced.
export default function CareerDecisionTreeView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.post('/custom-views/course-job-heatmap', {});
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); /* auto-load on mount */ }, []);

  const heatColor = (s) => {
    // 0 -> dark, 1 -> bright green
    const a = Math.min(1, Math.max(0, s));
    const r = Math.round(15 + (16 - 15) * a);
    const g = Math.round(23 + (185 - 23) * a);
    const b = Math.round(42 + (129 - 42) * a);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={card} data-testid="course-job-heatmap">
      <h3 style={h3}>Course - Role Match Heatmap</h3>
      <p style={muted}>VIZ — how well each course prepares you for each role (overlap score 0–1).</p>
      <div style={row}>
        <button onClick={run} disabled={loading} style={btn}>{loading ? 'Loading…' : 'Refresh Heatmap'}</button>
      </div>

      {data && (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={th}>Course \ Role</th>
                {data.roles.map(r => (
                  <th key={r.id} style={th}>{r.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map(row => (
                <tr key={row.courseId}>
                  <td style={tdName}>{row.courseName}</td>
                  {row.cells.map(c => (
                    <td key={c.roleId} title={`${c.matchedSkills} matched skills`} style={{ ...td, background: heatColor(c.score), color: c.score > 0.4 ? '#0b1220' : '#cbd5e1' }}>
                      {(c.score * 100).toFixed(0)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
            Hover a cell to see matched skill count. Greener = higher overlap.
          </div>
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
const btn = { padding: '8px 16px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' };
const th = { padding: '6px 8px', fontSize: 11, color: '#cbd5e1', background: '#0f172a', borderBottom: '1px solid #334155', textAlign: 'left', whiteSpace: 'nowrap' };
const td = { padding: '8px 10px', fontSize: 12, textAlign: 'center', minWidth: 64, borderBottom: '1px solid #1e293b' };
const tdName = { padding: '8px 10px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' };
const errBox = { marginTop: 10, padding: 10, background: '#7f1d1d', color: '#fee2e2', borderRadius: 8 };
