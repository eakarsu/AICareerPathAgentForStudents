import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Assessment Title', placeholder: 'e.g. Career Interest Assessment' },
  { key: 'assessment_type', label: 'Type', type: 'select', options: ['Holland Code (RIASEC)', 'Myers-Briggs', 'StrengthsFinder', 'Skills Assessment', 'Technical Skills Evaluation', 'Personality Assessment'] },
  { key: 'questions', label: 'Questions / Details', type: 'textarea', placeholder: 'Assessment questions or description...' },
  { key: 'results', label: 'Results', type: 'textarea', placeholder: 'Assessment results...' },
];

const displayFields = [
  { key: 'title', label: 'Assessment' },
  { key: 'assessment_type', label: 'Type', badge: true },
  { key: 'results', label: 'Results' },
];

const aiFeature = {
  label: 'Career Assessment',
  endpoint: 'ai-assess',
  fields: [
    { key: 'personality_traits', label: 'Personality Traits', type: 'textarea', placeholder: 'e.g. Analytical, creative, detail-oriented, collaborative...' },
    { key: 'interests', label: 'Interests', type: 'textarea', placeholder: 'e.g. Technology, art, problem-solving, helping people...' },
    { key: 'strengths', label: 'Strengths', type: 'textarea', placeholder: 'e.g. Programming, communication, leadership...' },
    { key: 'values', label: 'Values', type: 'textarea', placeholder: 'e.g. Work-life balance, innovation, social impact...' },
  ],
};

export default function Assessments() {
  return (
    <FeaturePage
      title="Career Assessment"
      icon="📋"
      apiEndpoint="assessments"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="assessment_type"
      cardDescField="results"
      aiFeature={aiFeature}
    />
  );
}
