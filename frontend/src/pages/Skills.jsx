import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'name', label: 'Skill Name', placeholder: 'e.g. Python Programming' },
  { key: 'category', label: 'Category', placeholder: 'e.g. Programming' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this skill...' },
  { key: 'difficulty_level', label: 'Difficulty Level', type: 'select', options: ['Beginner', 'Beginner-Intermediate', 'Intermediate', 'Advanced', 'Expert'] },
  { key: 'demand_level', label: 'Demand Level', type: 'select', options: ['Low', 'Moderate', 'High', 'Very High'] },
];

const displayFields = [
  { key: 'name', label: 'Skill' },
  { key: 'category', label: 'Category', badge: true },
  { key: 'difficulty_level', label: 'Difficulty' },
  { key: 'demand_level', label: 'Demand', badge: true },
];

const aiFeature = {
  label: 'Gap Analysis',
  endpoint: 'ai-gap-analysis',
  fields: [
    { key: 'current_skills', label: 'Your Current Skills', type: 'textarea', placeholder: 'e.g. HTML, CSS, basic JavaScript, Python basics...' },
    { key: 'target_career', label: 'Target Career', placeholder: 'e.g. Full-Stack Developer' },
  ],
};

export default function Skills() {
  return (
    <FeaturePage
      title="Skills Gap Analysis"
      icon="⚡"
      apiEndpoint="skills"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="name"
      cardSubtitleField="category"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
