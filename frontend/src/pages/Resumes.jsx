import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Resume Title', placeholder: 'e.g. Software Engineer Resume' },
  { key: 'content', label: 'Content / Summary', type: 'textarea', placeholder: 'Your experience and skills summary...' },
  { key: 'target_role', label: 'Target Role', placeholder: 'e.g. Frontend Developer' },
  { key: 'experience_level', label: 'Experience Level', type: 'select', options: ['Student', 'Entry Level', 'Junior', 'Mid-Level', 'Senior'] },
];

const displayFields = [
  { key: 'title', label: 'Title' },
  { key: 'target_role', label: 'Target Role' },
  { key: 'experience_level', label: 'Level', badge: true },
];

const aiFeature = {
  label: 'Resume Builder',
  endpoint: 'ai-build',
  fields: [
    { key: 'name', label: 'Your Name', placeholder: 'e.g. John Doe' },
    { key: 'education', label: 'Education', type: 'textarea', placeholder: 'e.g. BS Computer Science, MIT, 2025' },
    { key: 'skills', label: 'Skills', type: 'textarea', placeholder: 'e.g. React, Python, SQL, Git...' },
    { key: 'experience', label: 'Experience', type: 'textarea', placeholder: 'e.g. Software Intern at Google, Summer 2025...' },
    { key: 'target_role', label: 'Target Role', placeholder: 'e.g. Full-Stack Developer' },
  ],
};

export default function Resumes() {
  return (
    <FeaturePage
      title="Resume Builder"
      icon="📄"
      apiEndpoint="resumes"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="target_role"
      cardDescField="content"
      aiFeature={aiFeature}
    />
  );
}
