import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Title', placeholder: 'e.g. Software Engineer' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this career path...' },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
  { key: 'avg_salary', label: 'Average Salary', placeholder: 'e.g. $85,000 - $165,000' },
  { key: 'growth_rate', label: 'Growth Rate', placeholder: 'e.g. 25%' },
  { key: 'education_required', label: 'Education Required', placeholder: "e.g. Bachelor's in CS" },
  { key: 'skills', label: 'Key Skills', type: 'textarea', placeholder: 'e.g. JavaScript, Python, Cloud' },
];

const displayFields = [
  { key: 'title', label: 'Title' },
  { key: 'industry', label: 'Industry', badge: true },
  { key: 'avg_salary', label: 'Salary' },
  { key: 'growth_rate', label: 'Growth' },
  { key: 'education_required', label: 'Education' },
];

const aiFeature = {
  label: 'Career Recommendation',
  endpoint: 'ai-recommend',
  fields: [
    { key: 'interests', label: 'Your Interests', type: 'textarea', placeholder: 'e.g. Technology, problem-solving, creative design...' },
    { key: 'skills', label: 'Your Current Skills', type: 'textarea', placeholder: 'e.g. Python, basic web development, math...' },
    { key: 'education', label: 'Your Education', placeholder: "e.g. 2nd year CS student at MIT" },
  ],
};

export default function CareerPaths() {
  return (
    <FeaturePage
      title="Career Paths"
      icon="🎯"
      apiEndpoint="career-paths"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="industry"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
