'use strict';const test=require('node:test');const assert=require('node:assert/strict');const {validatePlan,transition}=require('../domain/planningWorkflow');
const valid=()=>({learnerId:'student-42',goals:[{title:'Complete an accessible internship'}],verifiedSkills:[{name:'writing',source:'LMS rubric',verifiedAt:'2026-07-01'}],coursework:[{externalId:'BIO-101',sourceSystem:'district-sis'}],consent:{student:true,capturedAt:'2026-07-01'}});
test('requires verified source evidence',()=>assert.throws(()=>validatePlan({...valid(),verifiedSkills:[{name:'writing'}]}),/source/));
test('requires student consent before review',()=>{const p=validatePlan({...valid(),consent:{student:false}});assert.throws(()=>transition('draft','submitted','student',p),/consent/);});
test('counselor approval needs a note',()=>{const p=validatePlan(valid());assert.throws(()=>transition('submitted','approved','student',p,'long enough approval'),/counselor/);assert.equal(transition('submitted','approved','counselor',p,'evidence reviewed and accepted'),'approved');});
test('rejects skipped workflow states',()=>assert.throws(()=>transition('draft','active','counselor',validatePlan(valid())),/not allowed/));
