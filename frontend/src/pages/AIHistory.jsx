import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/api';

export default function AIHistory() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0 });
  const [endpoint, setEndpoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await aiApi.results(page, 20, endpoint || undefined);
      setData(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, total_pages: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [page, endpoint]);

  const ENDPOINTS = [
    '', 'career-match', 'salary-negotiation', 'scholarship-eligibility',
    'personalized-roadmap', 'peer-mentor-match', 'company-culture-fit'
  ];

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <span className="page-icon">🗂️</span>
          <div>
            <h1>AI Run History</h1>
            <p>All your AI requests and results, paginated.</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Filter by endpoint: </label>
        <select value={endpoint} onChange={(e) => { setPage(1); setEndpoint(e.target.value); }}>
          {ENDPOINTS.map(e => <option key={e} value={e}>{e || 'All'}</option>)}
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <div>
          {data.length === 0 && <p>No AI runs yet.</p>}
          {data.map((row) => (
            <div key={row.id} style={{ padding: 12, background: '#1f2937', borderRadius: 12, margin: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{row.endpoint}</strong>
                <span style={{ color: '#94a3b8' }}>{new Date(row.created_at).toLocaleString()}</span>
              </div>
              <button className="btn" onClick={() => setExpanded(expanded === row.id ? null : row.id)} style={{ marginTop: 8 }}>
                {expanded === row.id ? 'Hide' : 'Show'} Details
              </button>
              {expanded === row.id && (
                <div style={{ marginTop: 12 }}>
                  <h4>Request</h4>
                  <pre style={{ background: '#0f172a', padding: 8, borderRadius: 8, color: '#e2e8f0', overflow: 'auto' }}>
                    {JSON.stringify(row.request_data, null, 2)}
                  </pre>
                  <h4>Result</h4>
                  <pre style={{ background: '#0f172a', padding: 8, borderRadius: 8, color: '#e2e8f0', overflow: 'auto', maxHeight: 400 }}>
                    {JSON.stringify(row.result_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span>Page {page} of {pagination.total_pages || 1} ({pagination.total} total)</span>
            <button className="btn" disabled={page >= (pagination.total_pages || 1)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
