import React, { useEffect, useState } from 'react';
import api from '../services/api';

// NON-VIZ #2: Skill / Role taxonomy editor (full CRUD).
// Filename kept (InterestSurveyWizardView) for stable imports; semantics replaced.
export default function InterestSurveyWizardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Forms
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleSkills, setNewRoleSkills] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.get('/custom-views/taxonomy');
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addRole = async () => {
    if (!newRoleTitle.trim()) return;
    try {
      await api.post('/custom-views/taxonomy', {
        type: 'role',
        title: newRoleTitle,
        skills: newRoleSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setNewRoleTitle(''); setNewRoleSkills('');
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const addSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      await api.post('/custom-views/taxonomy', { type: 'skill', name: newSkillName });
      setNewSkillName('');
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const rename = async (type, id, current) => {
    const next = window.prompt(`Rename ${type}:`, current);
    if (!next || next === current) return;
    try {
      await api.put(`/custom-views/taxonomy/${type}/${id}`, type === 'role' ? { title: next } : { name: next });
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const remove = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await api.delete(`/custom-views/taxonomy/${type}/${id}`);
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  return (
    <div style={card} data-testid="taxonomy-editor">
      <h3 style={h3}>Skill / Role Taxonomy Editor</h3>
      <p style={muted}>NON-VIZ — full CRUD over the role + skill catalog used by all other views.</p>

      {loading && <div style={{ color: '#94a3b8' }}>Loading…</div>}
      {err && <div style={errBox}>Error: {err}</div>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          {/* Roles */}
          <div style={pane}>
            <h4 style={paneH}>Roles ({data.roles.length})</h4>
            <div style={row}>
              <input style={inp} placeholder="New role title" value={newRoleTitle} onChange={e => setNewRoleTitle(e.target.value)} />
              <input style={inp} placeholder="skills, comma, separated" value={newRoleSkills} onChange={e => setNewRoleSkills(e.target.value)} />
              <button style={btn} onClick={addRole}>+ Add Role</button>
            </div>
            <ul style={list}>
              {data.roles.map(r => (
                <li key={r.id} style={li}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{r.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>{(r.skills || []).join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={miniBtn} onClick={() => rename('role', r.id, r.title)}>Rename</button>
                    <button style={miniDel} onClick={() => remove('role', r.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div style={pane}>
            <h4 style={paneH}>Skills ({data.skills.length})</h4>
            <div style={row}>
              <input style={inp} placeholder="New skill name" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} />
              <button style={btn} onClick={addSkill}>+ Add Skill</button>
            </div>
            <ul style={list}>
              {data.skills.map(s => (
                <li key={s.id} style={li}>
                  <div style={{ color: '#f1f5f9' }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={miniBtn} onClick={() => rename('skill', s.id, s.name)}>Rename</button>
                    <button style={miniDel} onClick={() => remove('skill', s.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const card = { background: '#1f2937', padding: 16, borderRadius: 12, border: '1px solid #334155', marginBottom: 16, color: '#f1f5f9' };
const h3 = { margin: '0 0 6px 0', color: '#f1f5f9' };
const muted = { color: '#94a3b8', marginTop: 0, fontSize: 13 };
const row = { display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' };
const inp = { padding: 6, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', flex: 1, minWidth: 120 };
const btn = { padding: '6px 12px', borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' };
const miniBtn = { padding: '3px 8px', fontSize: 11, borderRadius: 4, background: '#475569', color: '#fff', border: 'none', cursor: 'pointer' };
const miniDel = { padding: '3px 8px', fontSize: 11, borderRadius: 4, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' };
const pane = { background: '#0f172a', padding: 10, borderRadius: 8, border: '1px solid #334155', maxHeight: 360, overflowY: 'auto' };
const paneH = { color: '#cbd5e1', margin: '0 0 6px 0' };
const list = { listStyle: 'none', margin: 0, padding: 0 };
const li = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e293b' };
const errBox = { marginTop: 10, padding: 10, background: '#7f1d1d', color: '#fee2e2', borderRadius: 8 };
