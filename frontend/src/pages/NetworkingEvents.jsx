import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  { key: 'title', label: 'Event Title', placeholder: 'e.g. TechCrunch Disrupt 2026' },
  { key: 'event_date', label: 'Date', placeholder: 'e.g. October 2026' },
  { key: 'location', label: 'Location', placeholder: 'e.g. San Francisco, CA' },
  { key: 'event_type', label: 'Type', type: 'select', options: ['Conference', 'Hackathon', 'Meetup', 'Workshop', 'Summit', 'Convention', 'Festival', 'Online Course'] },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...' },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
  { key: 'url', label: 'URL', placeholder: 'https://...' },
];

const displayFields = [
  { key: 'title', label: 'Event' },
  { key: 'event_date', label: 'Date' },
  { key: 'location', label: 'Location' },
  { key: 'event_type', label: 'Type', badge: true },
  { key: 'industry', label: 'Industry' },
];

const aiFeature = {
  label: 'Event Suggestions',
  endpoint: 'ai-suggest',
  fields: [
    { key: 'career_field', label: 'Career Field', placeholder: 'e.g. Software Engineering' },
    { key: 'location', label: 'Your Location', placeholder: 'e.g. New York, NY' },
    { key: 'networking_goals', label: 'Networking Goals', type: 'textarea', placeholder: 'e.g. Find a mentor, get hired at a startup...' },
  ],
};

export default function NetworkingEvents() {
  return (
    <FeaturePage
      title="Networking Events"
      icon="🌐"
      apiEndpoint="networking-events"
      fields={fields}
      displayFields={displayFields}
      cardTitleField="title"
      cardSubtitleField="event_type"
      cardDescField="description"
      aiFeature={aiFeature}
    />
  );
}
