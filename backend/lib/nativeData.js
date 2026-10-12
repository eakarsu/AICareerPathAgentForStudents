const fs=require('node:fs'),path=require('node:path');
async function prepareNativeData(pool){
 const client=await pool.connect();try{await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('career-native-workspaces-v1'))");await client.query(fs.readFileSync(path.join(__dirname,'../migrations/004_work_simulation_portfolios.sql'),'utf8'));await client.query(fs.readFileSync(path.join(__dirname,'../migrations/005_native_career_workspaces.sql'),'utf8'));await client.query(fs.readFileSync(path.join(__dirname,'../migrations/006_career_taxonomy.sql'),'utf8'));await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
async function seedNativeDrafts(pool,{userId,minimum=15,expectedEmail}={}){
 if(!Number.isSafeInteger(Number(userId))||Number(userId)<1)throw new Error('Select an existing native user ID.');
 if(!Number.isInteger(minimum)||minimum<15||minimum>100)throw new Error('Minimum must be an integer between 15 and 100.');
 const client=await pool.connect();try{
  await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('career-draft-samples:'||$1::text))",[userId]);
  const actor=(await client.query('SELECT id,email FROM users WHERE id=$1 FOR SHARE',[userId])).rows[0];if(!actor||(expectedEmail&&actor.email!==expectedEmail))throw new Error('The selected existing native account is unavailable or changed.');
  const outcomes=[];
  const definitions={
   assessments:{columns:['user_id','title','assessment_type','questions','results'],values:i=>[userId,`Fictional career exploration draft ${i}`,'Skills Assessment','Practice reflection: what skills would I like to develop?','Not assessed; fictional training draft, no assessment or provider result.']},
   resumes:{columns:['user_id','title','content','target_role','experience_level'],values:i=>[userId,`Fictional resume practice draft ${i}`,'Fictional writing exercise. Outline education, class projects and learning goals. No verified employment, credentials or quantified achievements.',['Software Intern','Design Intern','Community Program Intern'][(i-1)%3],'Student']},
   portfolios:{columns:['user_id','title','description','projects','skills_showcased'],values:i=>[userId,`Fictional portfolio planning draft ${i}`,'Fictional planning example; no completed work or uploaded artifacts.','Planned class exercise: outline a small supervised project.','Communication, planning, reflection']},
   webhooks:{columns:['user_id','url','events','secret','active'],values:i=>[userId,`https://training.invalid/fictional-career-config/${i}`,['assessment.completed'],null,false]},
   career_followups:{columns:['user_id','task','owner','priority','status'],values:i=>[userId,`Fictional follow-up planning draft ${i}: review learning goals`,'Student',['Low','Medium','High'][(i-1)%3],'Draft']},
   work_simulation_portfolios:{columns:['user_id','simulation_ref','candidate_name','simulation_type','employer_scenario','communication_score','collaboration_score','creativity_score','critical_thinking_score','leadership_score','evidence','reviewer_notes','status','scheduled_at'],values:i=>[userId,`DEMO-CAREER-${userId}-${i}`,'Fictional student practice profile',['Class project planning','Practice communication exercise','Practice problem-solving exercise'][(i-1)%3],'Fictional supervised training scenario; no actual employer or performance evidence.',0,0,0,0,0,'[]','Not assessed; no verified artifacts, peer review or score.','scheduled','2026-11-15T12:00:00Z']},
  };
  for(const [table,definition]of Object.entries(definitions)){
   const before=Number((await client.query(`SELECT COUNT(*) FROM ${table} WHERE user_id=$1`,[userId])).rows[0].count);let inserted=0;
   for(let index=1;before+inserted<minimum&&index<=minimum*3;index++){
    const columns=[...definition.columns,'is_demo','demo_key'];const values=[...definition.values(index),true,`career-training-v1-${index}`];
    const result=await client.query(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${values.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT DO NOTHING RETURNING id`,values);inserted+=result.rowCount;
   }
   const after=Number((await client.query(`SELECT COUNT(*) FROM ${table} WHERE user_id=$1`,[userId])).rows[0].count);if(after<minimum)throw new Error(`Unable to prepare the requested ${table} drafts.`);outcomes.push({table,before,inserted,after});
  }
  outcomes.push(...await require('./careerTaxonomy').seedTaxonomy(client,{userId,minimum}));
  await client.query('COMMIT');return{status:'passed',outcomes,accountsChanged:0,providerCalls:0,scope:'Existing actor-owned fictional training and planning drafts only.'};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
module.exports={prepareNativeData,seedNativeDrafts};
