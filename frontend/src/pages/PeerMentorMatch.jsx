import React from 'react';
import AIFeatureForm from '../components/AIFeatureForm';
import { aiApi } from '../services/api';

export default function PeerMentorMatch() {
  return (
    <AIFeatureForm
      title="Peer Mentor Network"
      icon="🤝"
      description="Find peer mentors and study cohorts based on your interests and learning style."
      endpoint="/ai/peer-mentor-match"
      fields={[
        { key: 'interests', label: 'Interests', type: 'tags', required: true, placeholder: 'AI, Healthcare, Climate Tech' },
        { key: 'year_in_school', label: 'Year in School', type: 'select', options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student'] },
        { key: 'focus_areas', label: 'Focus Areas', type: 'tags', placeholder: 'Internships, Research, Side Projects' },
        { key: 'learning_style', label: 'Learning Style', type: 'select', options: ['Visual', 'Hands-on', 'Discussion', 'Reading', 'Mixed'] },
      ]}
      onSubmit={async (data) => (await aiApi.peerMentorMatch(data)).data}
      renderResult={(r) => (
        <div className="ai-response-container">
          <div className="ai-response-header">
            <div className="ai-badge"><span className="ai-pulse"></span><span>Peer Matches</span></div>
            <h3 className="ai-response-title">Recommended Peer Mentors</h3>
          </div>
          <div className="ai-response-body">
            {r.matched_peers?.length > 0 && r.matched_peers.map((p, i) => (
              <div key={i} style={{ padding: 12, background: '#1f2937', borderRadius: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{p.name}</strong>
                  <span>{p.match_score}%</span>
                </div>
                <p style={{ color: '#94a3b8' }}>{p.background}</p>
                <p><strong>Help with:</strong> {(p.what_they_can_help_with || []).join(', ')}</p>
                <p><strong>Try asking:</strong> "{p.suggested_first_topic}"</p>
              </div>
            ))}
            {r.study_groups?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>👥 Study Groups</h4>
                {r.study_groups.map((g, i) => (
                  <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '6px 0' }}>
                    <strong>{g.topic}</strong> — {g.size} members • {g.meeting_cadence}
                    {g.starter_questions?.length > 0 && (
                      <ul>{g.starter_questions.map((q, j) => <li key={j}>{q}</li>)}</ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {r.success_stories?.length > 0 && (
              <div>
                <h4>🌟 Success Stories</h4>
                {r.success_stories.map((s, i) => (
                  <div key={i} style={{ padding: 10, background: '#1f2937', borderRadius: 8, margin: '6px 0' }}>
                    <strong>{s.headline}</strong>
                    <p>{s.story}</p>
                    <small>Lesson: {s.lesson}</small>
                  </div>
                ))}
              </div>
            )}
            {r.icebreaker_messages?.length > 0 && (
              <div>
                <h4>💬 Icebreaker Messages</h4>
                <ul>{r.icebreaker_messages.map((m, i) => <li key={i}>"{m}"</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
