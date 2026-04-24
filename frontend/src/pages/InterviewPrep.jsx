import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'question', label: 'Question', type: 'textarea', placeholder: 'Enter the interview question...' },
  { key: 'category', label: 'Category', type: 'select', options: ['Behavioral', 'Technical', 'System Design', 'Product', 'Design', 'Communication', 'General'] },
  { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
  { key: 'career_path', label: 'Career Path', placeholder: 'e.g. Software Engineering' },
  { key: 'sample_answer', label: 'Sample Answer', type: 'textarea', placeholder: 'Provide a sample answer...' },
  { key: 'tips', label: 'Tips', type: 'textarea', placeholder: 'Interview tips...' },
];

const displayFields = [
  { key: 'question', label: 'Question' },
  { key: 'category', label: 'Category', badge: true },
  { key: 'difficulty', label: 'Difficulty', badge: true },
  { key: 'career_path', label: 'Career' },
];

const aiFeature = {
  label: 'Mock Interview',
  endpoint: 'ai-mock-interview',
  fields: [
    { key: 'career', label: 'Target Career', placeholder: 'e.g. Software Engineer at Google' },
    { key: 'experience_level', label: 'Experience Level', type: 'select', options: ['Student/Intern', 'New Graduate', 'Junior (1-2 years)', 'Mid-Level (3-5 years)'] },
    { key: 'question_type', label: 'Question Type', type: 'select', options: ['Behavioral', 'Technical', 'System Design', 'Mixed'] },
  ],
};

export default function InterviewPrep() {
  return (
    <FeaturePage
      title="Interview Prep"
      icon="🎤"
      apiEndpoint="interview-prep"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="question"
      cardSubtitleField="category"
      cardDescField="sample_answer"
      aiFeature={aiFeature}
    />
  );
}
