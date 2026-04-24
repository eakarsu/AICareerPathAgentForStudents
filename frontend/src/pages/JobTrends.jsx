import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Job Title', placeholder: 'e.g. AI/ML Engineer' },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
  { key: 'demand_level', label: 'Demand Level', type: 'select', options: ['Low', 'Moderate', 'High', 'Very High'] },
  { key: 'growth_percentage', label: 'Growth %', placeholder: 'e.g. 40%' },
  { key: 'avg_salary', label: 'Average Salary', placeholder: 'e.g. $130,000 - $200,000' },
  { key: 'location', label: 'Location', placeholder: 'e.g. San Francisco, Remote' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the trend...' },
];

const displayFields = [
  { key: 'title', label: 'Role' },
  { key: 'industry', label: 'Industry' },
  { key: 'demand_level', label: 'Demand', badge: true },
  { key: 'growth_percentage', label: 'Growth' },
  { key: 'avg_salary', label: 'Salary' },
];

const aiFeature = {
  label: 'Market Analysis',
  endpoint: 'ai-analyze',
  fields: [
    { key: 'industry', label: 'Industry', placeholder: 'e.g. Artificial Intelligence' },
    { key: 'region', label: 'Region', placeholder: 'e.g. United States, Silicon Valley' },
  ],
};

export default function JobTrends() {
  return (
    <FeaturePage
      title="Job Market Trends"
      icon="📊"
      apiEndpoint="job-trends"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="industry"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
