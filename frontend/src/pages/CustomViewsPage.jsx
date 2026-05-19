import React from 'react';
import SkillRadarView from '../components/SkillRadarView';
import CareerDecisionTreeView from '../components/CareerDecisionTreeView'; // course-job heatmap (file kept)
import CareerPlanPdfView from '../components/CareerPlanPdfView';
import InterestSurveyWizardView from '../components/InterestSurveyWizardView'; // taxonomy editor (file kept)

// Hosts 4 custom views for student career-path planning:
//   VIZ:     Skill-Gap Radar + Bar, Course-to-Role Match Heatmap
//   NON-VIZ: Career Plan PDF, Skill/Role Taxonomy Editor (CRUD)
// Mounted at /custom-views, surfaced via sidebar "Career Views".
export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ color: '#f1f5f9', margin: 0 }} data-testid="career-views-title">Career Views</h1>
        <p style={{ color: '#94a3b8', marginTop: 6 }}>
          4 custom views for student career-path planning — 2 visualizations + 2 workflow tools.
        </p>
      </header>

      <section>
        <SkillRadarView />
        <CareerDecisionTreeView />
        <CareerPlanPdfView />
        <InterestSurveyWizardView />
      </section>
    </div>
  );
}
