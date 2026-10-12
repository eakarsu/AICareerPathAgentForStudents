export const careerScenarios = ['Technology student', 'Creative career changer', 'Community services student'];
const roles = ['Software Engineer', 'UX Designer', 'Community Program Coordinator'];
const interests = ['Coding, accessible technology, sustainability', 'Visual design, research, storytelling', 'Community support, education, public service'];
const skills = ['JavaScript, Python, communication', 'Design, qualitative research, writing', 'Organization, public speaking, teamwork'];
export function careerExample(fields, index, current = {}) {
  const scenario = index % 3;
  const role = roles[scenario];
  const values = {
    interests: interests[scenario], skills: skills[scenario], current_skills: skills[scenario],
    role, target_career: role, target_role: role, targetCareer: role, career: role, career_goal: role, job_title: role,
    education: ['Second-year computer science student', 'Design diploma and continuing education', 'First-year public administration student'][scenario],
    name: ['Alex Example', 'Jordan Example', 'Taylor Example'][scenario],
    industry: ['Technology', 'Design services', 'Community services'][scenario],
    career_field: ['Software development', 'Design', 'Community services'][scenario],
    field_of_study: ['Computer Science', 'Design', 'Public Administration'][scenario],
    career_interest: role, location: ['Austin, Texas', 'Portland, Oregon', 'Chicago, Illinois'][scenario],
    region: ['Texas', 'Oregon', 'Illinois'][scenario],
    goals: `Fictional practice profile: explore ${role} opportunities, identify a first portfolio project, and plan an informational interview.`,
    networking_goals: 'Practice introducing my background and finding a student-friendly learning community.',
    experience: ['Fictional practice experience: created a small class web application and collaborated with two classmates.', 'Fictional practice experience: redesigned a student club poster and gathered feedback from volunteers.', 'Fictional practice experience: organized a practice community event plan for a class assignment.'][scenario],
    background: 'Fictional student profile for practice; no verified eligibility, applications, or awards.',
    personality_traits: ['Analytical, curious, collaborative', 'Creative, reflective, empathetic', 'Organized, supportive, adaptable'][scenario],
    strengths: skills[scenario], values: ['Learning, autonomy, inclusion', 'Creativity, mentorship, balance', 'Service, fairness, teamwork'][scenario],
    focus_areas: ['Internships, portfolio projects', 'Career transition, design practice', 'Community projects, mentoring'][scenario],
    deal_breakers: 'Mandatory unpaid overtime, unclear supervision',
    job_description: `Fictional ${role} internship: collaborate on a small supervised project, document decisions, and communicate progress.`,
    question: 'Tell me about a time you worked with others to solve a problem.',
    answer: `Fictional practice answer: our class team needed a project plan. I gathered priorities, proposed three tasks, and scheduled a check-in. We completed the class exercise and learned to document responsibilities.`,
    gpa: [3.5, 3.2, 3.7][scenario], timeline_months: [6, 9, 12][scenario], monthly_hours: [40, 24, 0][scenario],
    offer_details: {role,base:[65000,58000,52000][scenario],bonus:0,equity:'None',location:['Austin, Texas','Portland, Oregon','Chicago, Illinois'][scenario],yoe:0,demo_sample:true},
    market_data: {p25:50000,p50:62000,p75:74000,source:'Fictional training benchmarks; not verified market data',demo_sample:true},
    student_profile: {gpa:[3.5,3.2,3.7][scenario],field_of_study:['Computer Science','Design','Public Administration'][scenario],year:['Sophomore','Junior','Freshman'][scenario],ethnicity:'Not specified',location:['Texas','Oregon','Illinois'][scenario],extracurriculars:['Fictional student club'],income_bracket:'Not specified',first_generation:false,essays:'Fictional practice statement about learning goals',demo_sample:true},
    company_data: {name:['Example Technology Studio','Example Design Collective','Example Community Center'][scenario],size:'Fictional small team',values_page:'Fictional training brief, no verified web source',glassdoor_themes:[],interview_signals:['Fictional interview practice: ask about supervision'],benefits:['Fictional flexible study schedule'],leadership:'Not independently verified',demo_sample:true},
  };
  const result = {...current};
  for (const field of fields) {
    const key = field.key;
    if(field.sourceReference){const choices=(field.options||[]).filter(option=>String(typeof option==='object'?option.value:option));const currentValue=choices.find(option=>String(typeof option==='object'?option.value:option)===String(current[key]??''));const selected=currentValue??choices[scenario%(choices.length||1)];if(selected===undefined)throw new Error(`Load or create an actual owned ${field.label.toLowerCase()} before using this example.`);result[key]=typeof selected==='object'?selected.value:selected;continue;}
    if (key==='source_data' && current[key] && !String(current[key]).startsWith('Fictional')) continue;
    if (/^(?:.*_)?(?:id|source_url|source_uri|file|attachment|consent|approved|credential|password|token)$/i.test(key)) continue;
    if (field.type==='array_json' && current[key]) {
      try { const entered = typeof current[key] === 'string' ? JSON.parse(current[key]) : current[key];
        if (!entered.demo_sample) { result[key] = typeof entered === 'string' ? entered : JSON.stringify(entered,null,2); continue; }
      } catch (_) { result[key]=current[key]; continue; }
    }
    if (field.type === 'select') {
      const options = (field.options || []).filter(option => (typeof option === 'object' ? option.value : option) !== '');
      const option = options[scenario % (options.length || 1)];
      result[key] = typeof option === 'object' ? option.value : (option ?? '');
    } else if (field.type === 'checkbox') result[key] = scenario === 1;
    else if (field.type === 'number') result[key] = values[key] ?? Math.max(Number(field.min) || 0, scenario + 1);
    else if (field.type === 'array_json') {
      if (!(key in values)) throw new Error(`A typed example is required for ${field.label}.`);
      result[key] = JSON.stringify(values[key],null,2);
    } else result[key] = values[key] ?? `Fictional ${careerScenarios[scenario].toLowerCase()} practice: ${field.label}.`;
  }
  return result;
}
export function requestValues(fields, values) {
  return Object.fromEntries(fields.map(field => {
    let value = values[field.key] ?? '';
    if(field.sourceReference&&!field.options?.some(option=>String(typeof option==='object'?option.value:option)===String(value)))throw new Error(`Select an actual loaded ${field.label.toLowerCase()} before generating.`);
    if (field.type === 'tags') value = Array.isArray(value) ? value : String(value).split(',').map(part=>part.trim()).filter(Boolean);
    if (field.type === 'array_json') {
      if (typeof value === 'string' && value.trim()) {
        try { value = JSON.parse(value); } catch (_) { throw new Error(`${field.label} must contain valid JSON.`); }
      } else if (!value && !field.required) value = null;
      if (field.required && (value === null || typeof value !== 'object')) throw new Error(`${field.label} must contain a JSON object or array.`);
    }
    if (field.type === 'number' && value !== '') {
      value = Number(value); if (!Number.isFinite(value)) throw new Error(`${field.label} must be a valid number.`);
    }
    return [field.key,value];
  }));
}
