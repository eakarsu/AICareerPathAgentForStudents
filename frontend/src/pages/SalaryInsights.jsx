import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'role', label: 'Role', placeholder: 'e.g. Software Engineer' },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
  { key: 'entry_level', label: 'Entry Level Salary', placeholder: 'e.g. $75,000' },
  { key: 'mid_level', label: 'Mid Level Salary', placeholder: 'e.g. $120,000' },
  { key: 'senior_level', label: 'Senior Level Salary', placeholder: 'e.g. $165,000' },
  { key: 'location', label: 'Location', placeholder: 'e.g. US National Average' },
  { key: 'description', label: 'Notes', type: 'textarea', placeholder: 'Additional salary notes...' },
];

const displayFields = [
  { key: 'role', label: 'Role' },
  { key: 'industry', label: 'Industry' },
  { key: 'entry_level', label: 'Entry' },
  { key: 'mid_level', label: 'Mid' },
  { key: 'senior_level', label: 'Senior' },
];

const aiFeature = {
  label: 'Salary Estimate',
  endpoint: 'ai-estimate',
  fields: [
    { key: 'role', label: 'Job Role', placeholder: 'e.g. Data Scientist' },
    { key: 'location', label: 'Location', placeholder: 'e.g. San Francisco, CA' },
    { key: 'experience', label: 'Experience Level', type: 'select', options: ['Student/Intern', 'New Graduate', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
  ],
};

export default function SalaryInsights() {
  return (
    <FeaturePage
      title="Salary Insights"
      icon="💰"
      apiEndpoint="salary-insights"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="role"
      cardSubtitleField="industry"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
