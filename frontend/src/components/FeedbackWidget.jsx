import React, { useState } from 'react';
import { aiApi } from '../services/api';

/**
 * Inline 1-5 star rating + flag/comment widget for AI responses.
 *
 * Props:
 * - endpoint: which AI endpoint generated the result
 * - requestData: raw request payload (stored for context)
 */
export default function FeedbackWidget({ endpoint, requestData }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const submitRating = async (value) => {
    setRating(value);
    try {
      await aiApi.feedback({
        endpoint,
        rating: value,
        request_data: requestData,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  const submitFlag = async () => {
    try {
      await aiApi.feedback({
        endpoint,
        rating: rating || 1,
        flagged: true,
        flag_reason: flagReason || 'Reported as incorrect',
        comment,
        request_data: requestData,
      });
      setSubmitted(true);
      setShowFlagForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to flag response');
    }
  };

  if (submitted) {
    return (
      <div style={{ marginTop: 16, padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 8 }}>
        ✓ Thank you for your feedback!
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16, padding: 16, background: '#1f2937', borderRadius: 12 }}>
      <div style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 8 }}>
        Was this helpful? Rate this AI response:
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => submitRating(n)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              color: rating >= n ? '#facc15' : '#475569',
            }}
            title={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
        <button
          type="button"
          className="btn"
          style={{ marginLeft: 12, background: '#7f1d1d', color: '#fff', padding: '4px 10px', fontSize: 12 }}
          onClick={() => setShowFlagForm(!showFlagForm)}
        >
          🚩 Flag as incorrect
        </button>
      </div>
      {showFlagForm && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="Reason for flagging"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <textarea
            rows={2}
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <button type="button" className="btn btn-primary" onClick={submitFlag}>
            Submit Flag
          </button>
        </div>
      )}
      {error && <div style={{ color: '#fca5a5', marginTop: 8, fontSize: 13 }}>{error}</div>}
    </div>
  );
}
