import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'industry', label: 'Industry', placeholder: 'e.g. Artificial Intelligence' },
  { key: 'overview', label: 'Overview', type: 'textarea', placeholder: 'Industry overview...' },
  { key: 'trends', label: 'Trends', type: 'textarea', placeholder: 'Current trends...' },
  { key: 'top_companies', label: 'Top Companies', type: 'textarea', placeholder: 'e.g. Google, Microsoft, OpenAI...' },
  { key: 'challenges', label: 'Challenges', type: 'textarea', placeholder: 'Key challenges...' },
  { key: 'opportunities', label: 'Opportunities', type: 'textarea', placeholder: 'Key opportunities...' },
];

const displayFields = [
  { key: 'industry', label: 'Industry' },
  { key: 'overview', label: 'Overview' },
  { key: 'top_companies', label: 'Top Companies' },
];

const aiFeature = {
  label: 'Industry Analysis',
  endpoint: 'ai-analyze',
  fields: [
    { key: 'industry', label: 'Industry', placeholder: 'e.g. Quantum Computing' },
    { key: 'aspect', label: 'Focus Area', type: 'select', options: ['Overall Overview', 'Career Opportunities', 'Investment & Growth', 'Technology Trends', 'Competitive Landscape'] },
  ],
};

export default function IndustryInsights() {
  return (
    <FeaturePage
      title="Industry Insights"
      icon="🏭"
      apiEndpoint="industry-insights"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="industry"
      cardSubtitleField="trends"
      cardDescField="overview"
      aiFeature={aiFeature}
    />
  );
}
