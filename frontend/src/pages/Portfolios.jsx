import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Portfolio Title', placeholder: 'e.g. Web Development Portfolio' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your portfolio...' },
  { key: 'projects', label: 'Projects', type: 'textarea', placeholder: 'List your projects...' },
  { key: 'skills_showcased', label: 'Skills Showcased', type: 'textarea', placeholder: 'e.g. React, Node.js, PostgreSQL...' },
];

const displayFields = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'skills_showcased', label: 'Skills' },
];

const aiFeature = {
  label: 'Portfolio Suggestions',
  endpoint: 'ai-suggest',
  fields: [
    { key: 'career_field', label: 'Career Field', placeholder: 'e.g. Frontend Development' },
    { key: 'skill_level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'interests', label: 'Interests', type: 'textarea', placeholder: 'e.g. AI, web apps, mobile development...' },
  ],
};

export default function Portfolios() {
  return (
    <FeaturePage
      title="Portfolio Builder"
      icon="💼"
      apiEndpoint="portfolios"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="skills_showcased"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
