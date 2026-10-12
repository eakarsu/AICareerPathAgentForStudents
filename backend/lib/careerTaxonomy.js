const ROLE_CATALOG = [
  { id: 'sde',  title: 'Software Engineer',     skills: ['JavaScript','Python','Algorithms','Git','System Design','Testing'] },
  { id: 'ds',   title: 'Data Scientist',        skills: ['Python','Statistics','SQL','Machine Learning','Visualization','Pandas'] },
  { id: 'des',  title: 'UX / Product Designer', skills: ['Figma','User Research','Prototyping','Typography','Wireframing','Empathy'] },
  { id: 'pm',   title: 'Product Manager',       skills: ['Communication','Roadmapping','Analytics','User Research','Prioritization','Writing'] },
  { id: 'bio',  title: 'Biomedical Researcher', skills: ['Lab Skills','Biology','Statistics','Scientific Writing','Chemistry','Critical Thinking'] },
  { id: 'civ',  title: 'Civil Engineer',        skills: ['Math','CAD','Physics','Materials','Project Management','Safety'] },
  { id: 'edu',  title: 'Teacher / Educator',    skills: ['Pedagogy','Communication','Patience','Curriculum','Empathy','Assessment'] },
  { id: 'fin',  title: 'Financial Analyst',     skills: ['Excel','Accounting','Statistics','Financial Modeling','Communication','SQL'] },
];

const TRAINING_ROLES = [
 ['training-community','Training example · Community program planner',['Communication','Planning','Reflection']],
 ['training-library','Training example · Library project assistant',['Writing','Organization','Communication']],
 ['training-web','Training example · Web project learner',['HTML','CSS','Testing']],
 ['training-design','Training example · Design project learner',['Sketching','Prototyping','Reflection']],
 ['training-science','Training example · Science club planner',['Observation','Planning','Safety']],
 ['training-finance','Training example · Budget planning learner',['Arithmetic','Organization','Reflection']],
 ['training-teaching','Training example · Peer learning planner',['Communication','Planning','Patience']],
].map(([id,title,skills])=>({id,title,skills}));
async function seedTaxonomy(client,{userId,minimum=15}){
 const definitions=[...ROLE_CATALOG,...TRAINING_ROLES];
 for(let index=definitions.length;index<minimum;index++)definitions.push({id:'training-'+index,title:'Training example · Career exploration '+(index+1),skills:['Planning','Reflection']});
 const skillNames=[...new Set(definitions.flatMap(role=>role.skills))];
 for(let index=skillNames.length;index<minimum;index++)skillNames.push('Training practice skill '+(index+1));
 const outcomes=[];
 for(const kind of ['role','skill']){
  const before=Number((await client.query('SELECT COUNT(*) FROM career_taxonomy_entries WHERE user_id=$1 AND kind=$2',[userId,kind])).rows[0].count);let inserted=0;
  const rows=kind==='role'?definitions:skillNames.map((name,index)=>({id:'sk_'+index,title:name,skills:[]}));
  for(const row of rows){
   const result=await client.query('INSERT INTO career_taxonomy_entries(user_id,kind,key,title,skills,is_demo) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(user_id,kind,key) DO NOTHING RETURNING id',[userId,kind,row.id,row.title,JSON.stringify(row.skills)]);inserted+=result.rowCount;
  }
  const after=Number((await client.query('SELECT COUNT(*) FROM career_taxonomy_entries WHERE user_id=$1 AND kind=$2',[userId,kind])).rows[0].count);
  if(after<minimum)throw new Error('Unable to prepare the requested taxonomy examples.');
  outcomes.push({table:'career_taxonomy_entries',collection:'taxonomy-'+kind+'s',before,inserted,after});
 }
 return outcomes;
}
function projectRow(row){return{id:row.key,...(row.kind==='role'?{title:row.title,skills:row.skills}:{name:row.title}),is_demo:row.is_demo,demo_label:row.is_demo?'Illustrative training taxonomy; verify before career decisions.':null,created_at:row.created_at,updated_at:row.updated_at};}
async function loadTaxonomy(pool,userId){
 const rows=(await pool.query('SELECT * FROM career_taxonomy_entries WHERE user_id=$1 ORDER BY kind,id LIMIT 1000',[userId])).rows;
 return{roles:rows.filter(row=>row.kind==='role').map(projectRow),skills:rows.filter(row=>row.kind==='skill').map(projectRow)};
}
module.exports={seedTaxonomy,loadTaxonomy,projectRow};
