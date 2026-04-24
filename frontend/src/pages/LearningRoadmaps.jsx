import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Roadmap Title', placeholder: 'e.g. Full-Stack Web Developer' },
  { key: 'career_path', label: 'Career Path', placeholder: 'e.g. Software Engineering' },
  { key: 'steps', label: 'Steps', type: 'textarea', placeholder: 'Step-by-step learning path...' },
  { key: 'duration', label: 'Duration', placeholder: 'e.g. 6-9 months' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this roadmap...' },
];

const displayFields = [
  { key: 'title', label: 'Roadmap' },
  { key: 'career_path', label: 'Career Path' },
  { key: 'duration', label: 'Duration' },
];

const aiFeature = {
  label: 'Generate Roadmap',
  endpoint: 'ai-generate',
  fields: [
    { key: 'career_goal', label: 'Career Goal', placeholder: 'e.g. Become a Machine Learning Engineer' },
    { key: 'current_level', label: 'Current Level', type: 'select', options: ['Complete Beginner', 'Some Programming Experience', 'Intermediate Developer', 'Experienced Developer'] },
    { key: 'timeline', label: 'Timeline', type: 'select', options: ['3 months', '6 months', '9 months', '12 months', '18 months'] },
  ],
};

export default function LearningRoadmaps() {
  return (
    <FeaturePage
      title="Learning Roadmaps"
      icon="🗺️"
      apiEndpoint="learning-roadmaps"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="career_path"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
