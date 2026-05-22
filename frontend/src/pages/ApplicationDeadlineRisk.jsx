import React, { useState } from 'react';
import api from '../services/api';

export default function ApplicationDeadlineRisk() {
  const [payload, setPayload] = useState(JSON.stringify({ applications: [
    { school: 'State University', due_in_days: 12, essays_done: 1, essays_total: 3, fafsa_done: false, recommendation_done: true },
    { school: 'Metro Tech', due_in_days: 28, essays_done: 2, essays_total: 2, fafsa_done: true, recommendation_done: false }
  ] }, null, 2));
  const [result, setResult] = useState(null);
  const run = async () => setResult((await api.post('/application-deadline-risk/score', JSON.parse(payload))).data);
  return (
    <div className="page">
      <h1>Application Deadline Risk</h1>
      <p>Prioritize college and scholarship application work by deadline, essays, FAFSA, and recommendation gaps.</p>
      <textarea className="form-control" rows={14} value={payload} onChange={(event) => setPayload(event.target.value)} />
      <button className="btn btn-primary" onClick={run}>Score Applications</button>
      {result && <div className="card"><h2>{result.urgentCount} urgent</h2>{result.applications.map((row) => <p key={row.school}>{row.school}: {row.tier} · {row.action}</p>)}</div>}
    </div>
  );
}
