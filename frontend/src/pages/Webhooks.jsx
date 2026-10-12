import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AIReport from '../components/AIReport';

const ALLOWED_EVENTS = [
  'assessment.completed',
  'roadmap.generated',
  'resume.updated',
  'mentor.matched',
  'scholarship.recommended',
  'course.completed',
  'career_path.changed',
  'event.registered',
];

export default function Webhooks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ url: '', secret: '', events: ['assessment.completed'] });
  const [testResult, setTestResult] = useState(null);
  const [selected,setSelected]=useState(null),[editing,setEditing]=useState(false),[draft,setDraft]=useState({url:'',events:[]});
  const open=async item=>{try{const {data}=await axios.get(`/api/webhooks/${item.id}`,{headers});setSelected(data);setDraft({url:data.url,events:data.events});setEditing(false);setError('');}catch(error){setError(error.response?.data?.error||error.message);}};
  const update=async event=>{event.preventDefault();setCreating(true);try{const {data}=await axios.put(`/api/webhooks/${selected.id}`,draft,{headers});setSelected(data);setEditing(false);await load();}catch(error){setError(error.response?.data?.error||error.message);}finally{setCreating(false);}};

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get('/api/webhooks', { headers });
      const rows=Array.isArray(data)?data:data?.data; if(!Array.isArray(rows)||rows.some(row=>!row||row.id===undefined||!Array.isArray(row.events)||typeof row.url!=='string'))throw new Error('Invalid subscription list');setItems(rows);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleEvent = (ev) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.url) { setError('URL is required'); return; }
    if (form.events.length === 0) { setError('Select at least one event'); return; }
    setCreating(true); setError('');
    try {
      await axios.post('/api/webhooks', {
        url: form.url, events: form.events, secret: form.secret || null,
      }, { headers });
      setForm({ url: '', secret: '', events: ['assessment.completed'] });
      load();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setCreating(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this webhook?')) return;
    try {
      await axios.delete(`/api/webhooks/${id}`, { headers });
      setItems((xs) => xs.filter((x) => x.id !== id));setSelected(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const test = async (id) => {
    setTestResult(null); setError('');
    try {
      const { data } = await axios.post(`/api/webhooks/${id}/test`, {}, { headers });
      setTestResult(data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔔 Webhook Subscriptions</h1>
        <p>Subscribe external systems to career events</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}<button className="btn btn-secondary" onClick={load}>Retry</button></div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>+ New Subscription</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Endpoint URL</label>
              <input type="url" placeholder="https://example.com/hooks/career" value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Signing Secret (optional)</label>
              <input type="text" placeholder="hex/base64" value={form.secret}
                onChange={(e) => setForm({ ...form, secret: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Events</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALLOWED_EVENTS.map((ev) => (
                <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Creating...' : 'Create Subscription'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Configured Webhooks</h3><p>Fictional examples are inactive configuration drafts at the reserved training.invalid domain. Select your actual endpoint manually. Payload previews do not send deliveries.</p>
        {loading && <p>Loading...</p>}
        {!loading && !error && items.length === 0 && <p>No webhooks subscribed yet.</p>}
        {!loading && items.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>URL</th><th>Events</th><th>Active</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id} onClick={()=>open(w)} className="table-row-clickable">
                  <td>{w.id}</td>
                  <td style={{ wordBreak: 'break-all', maxWidth: 280 }}>{w.url}{w.is_demo&&<small className="career-record-muted"> · Fictional inactive draft</small>}</td>
                  <td style={{ fontSize: 12 }}>{(w.events || []).join(', ')}</td>
                  <td>{w.active ? 'Yes' : 'No'}</td>
                  <td>{w.created_at ? new Date(w.created_at).toLocaleString() : ''}</td>
                  <td onClick={event=>event.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => open(w)}>Details</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => test(w.id)} style={{ marginRight: 8 }}>Preview payload</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => remove(w.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected&&<div className="modal-overlay" onClick={()=>{if(!creating)setSelected(null);}}><div className="modal-content" role="dialog" aria-modal="true" aria-label="Webhook configuration" onClick={event=>event.stopPropagation()}><header className="modal-header"><h2>Webhook configuration</h2><button className="modal-close" onClick={()=>setSelected(null)}>×</button></header><div className="modal-body"><p>{selected.is_demo?'Fictional inactive configuration draft; no signing credential or delivery is asserted.':'Native endpoint configuration; payload previews do not execute delivery.'}</p>{editing?<form id="webhook-edit" onSubmit={update}><div className="form-group"><label htmlFor="webhook-edit-url">Endpoint URL</label><input id="webhook-edit-url" type="url" required value={draft.url} onChange={event=>setDraft({...draft,url:event.target.value})}/></div><div className="form-group"><label>Subscribed events</label>{ALLOWED_EVENTS.map(value=><label key={value}><input type="checkbox" checked={draft.events.includes(value)} onChange={()=>setDraft({...draft,events:draft.events.includes(value)?draft.events.filter(event=>event!==value):[...draft.events,value]})}/>{value}</label>)}</div><p>Signing credentials are retained and are never displayed.</p></form>:<dl><dt>Endpoint</dt><dd>{selected.url}</dd><dt>Events</dt><dd>{selected.events.join(', ')}</dd><dt>Active</dt><dd>{selected.active?'Yes':'No'}</dd><dt>Signing credential</dt><dd>{selected.has_secret?'Stored; not displayed':'Not configured'}</dd></dl>}{error&&<p role="alert">{error}</p>}</div><footer className="modal-actions"><button className="btn btn-secondary" disabled={creating} onClick={()=>{if(editing)setEditing(false);else setSelected(null);}}>Cancel</button>{editing?<button className="btn btn-primary" disabled={creating} type="submit" form="webhook-edit">Save configuration</button>:<button className="btn btn-primary" onClick={()=>setEditing(true)}>Edit</button>}<button className="btn btn-danger" disabled={creating} onClick={()=>remove(selected.id)}>Delete</button></footer></div></div>}
      {testResult && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Payload preview · not delivered</h3>
          <AIReport response={testResult} title="Payload preview" sourceLabel="Local preview · not delivered"/>
        </div>
      )}
    </div>
  );
}
