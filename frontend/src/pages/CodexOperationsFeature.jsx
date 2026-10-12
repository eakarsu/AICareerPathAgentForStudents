import React from 'react';
import FeaturePage from '../components/FeaturePage';
const fields=[{key:'task',label:'Follow-up task',type:'textarea'},{key:'owner',label:'Planning owner'},{key:'priority',label:'Priority',type:'select',options:['Low','Medium','High']},{key:'status',label:'Planning status',type:'select',options:['Draft','Planned','In progress','Done']}];
export default function CodexOperationsFeature(){return <FeaturePage title="Career Follow-ups" icon="📋" apiEndpoint="career-followups" fields={fields} displayFields={fields} cardTitleField="task"/>;}
