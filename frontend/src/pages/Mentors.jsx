import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'name', label: 'Name', placeholder: 'e.g. Dr. Sarah Chen' },
  { key: 'title', label: 'Title', placeholder: 'e.g. Principal ML Engineer' },
  { key: 'company', label: 'Company', placeholder: 'e.g. Google' },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. AI/ML' },
  { key: 'expertise', label: 'Expertise', type: 'textarea', placeholder: 'e.g. Deep Learning, NLP...' },
  { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Brief biography...' },
  { key: 'availability', label: 'Availability', type: 'select', options: ['Weekdays', 'Evenings', 'Weekends', 'Bi-weekly', 'Monthly'] },
];

const displayFields = [
  { key: 'name', label: 'Name' },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'industry', label: 'Industry', badge: true },
  { key: 'availability', label: 'Availability' },
];

const aiFeature = {
  label: 'Mentor Match',
  endpoint: 'ai-match',
  fields: [
    { key: 'career_interest', label: 'Career Interest', placeholder: 'e.g. Machine Learning Engineering' },
    { key: 'goals', label: 'Mentoring Goals', type: 'textarea', placeholder: 'e.g. Transition from academia to industry...' },
    { key: 'preferred_style', label: 'Preferred Style', type: 'select', options: ['Hands-on guidance', 'Strategic advice', 'Accountability partner', 'Network connector', 'Technical deep-dives'] },
  ],
};

export default function Mentors() {
  return (
    <FeaturePage
      title="Mentorship"
      icon="🤝"
      apiEndpoint="mentors"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="name"
      cardSubtitleField="company"
      cardDescField="bio"
      aiFeature={aiFeature}
    />
  );
}
