import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get('/api/webhooks', { headers });
      setItems(Array.isArray(data) ? data : (data?.data || []));
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
      setItems((xs) => xs.filter((x) => x.id !== id));
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

      {error && <div className="alert alert-error">{error}</div>}

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
        <h3>Active Webhooks</h3>
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && <p>No webhooks subscribed yet.</p>}
        {!loading && items.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>URL</th><th>Events</th><th>Active</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td>{w.id}</td>
                  <td style={{ wordBreak: 'break-all', maxWidth: 280 }}>{w.url}</td>
                  <td style={{ fontSize: 12 }}>{(w.events || []).join(', ')}</td>
                  <td>{w.active ? 'Yes' : 'No'}</td>
                  <td>{w.created_at ? new Date(w.created_at).toLocaleString() : ''}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => test(w.id)} style={{ marginRight: 8 }}>Test</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => remove(w.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {testResult && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Test Payload</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
