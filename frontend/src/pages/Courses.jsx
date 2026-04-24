import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Course Title', placeholder: 'e.g. Machine Learning Specialization' },
  { key: 'provider', label: 'Provider', placeholder: 'e.g. Coursera, edX' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this course...' },
  { key: 'duration', label: 'Duration', placeholder: 'e.g. 3 months' },
  { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'url', label: 'URL', placeholder: 'https://...' },
];

const displayFields = [
  { key: 'title', label: 'Course' },
  { key: 'provider', label: 'Provider' },
  { key: 'duration', label: 'Duration' },
  { key: 'level', label: 'Level', badge: true },
];

const aiFeature = {
  label: 'Course Recommendations',
  endpoint: 'ai-recommend',
  fields: [
    { key: 'career_goal', label: 'Career Goal', placeholder: 'e.g. Become a Data Scientist' },
    { key: 'current_level', label: 'Current Level', type: 'select', options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced'] },
    { key: 'budget', label: 'Budget', type: 'select', options: ['Free only', 'Under $50/mo', 'Under $200 total', 'No limit'] },
  ],
};

export default function Courses() {
  return (
    <FeaturePage
      title="Course Recommendations"
      icon="📚"
      apiEndpoint="courses"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="provider"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
