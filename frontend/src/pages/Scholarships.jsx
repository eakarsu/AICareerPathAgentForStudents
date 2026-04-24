import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'name', label: 'Scholarship Name', placeholder: 'e.g. Google Generation Scholarship' },
  { key: 'provider', label: 'Provider', placeholder: 'e.g. Google' },
  { key: 'amount', label: 'Amount', placeholder: 'e.g. $10,000' },
  { key: 'deadline', label: 'Deadline', placeholder: 'e.g. March 15, 2026' },
  { key: 'eligibility', label: 'Eligibility', type: 'textarea', placeholder: 'Who is eligible...' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Scholarship details...' },
  { key: 'url', label: 'URL', placeholder: 'https://...' },
];

const displayFields = [
  { key: 'name', label: 'Scholarship' },
  { key: 'provider', label: 'Provider' },
  { key: 'amount', label: 'Amount' },
  { key: 'deadline', label: 'Deadline' },
];

const aiFeature = {
  label: 'Scholarship Finder',
  endpoint: 'ai-find',
  fields: [
    { key: 'field_of_study', label: 'Field of Study', placeholder: 'e.g. Computer Science' },
    { key: 'gpa', label: 'GPA', placeholder: 'e.g. 3.7' },
    { key: 'background', label: 'Background', type: 'textarea', placeholder: 'e.g. First-generation college student, community volunteer...' },
  ],
};

export default function Scholarships() {
  return (
    <FeaturePage
      title="Scholarships"
      icon="🎓"
      apiEndpoint="scholarships"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="name"
      cardSubtitleField="provider"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
