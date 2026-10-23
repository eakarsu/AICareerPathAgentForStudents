
'use strict';
// Feature pack 29A pure helpers — no DB/provider side effects.
function hasAIKey(env=process.env){ return Boolean(env.OPENROUTER_API_KEY||env.OPENAI_API_KEY); }
function filterRecords(records, opts={}){
  const list=Array.isArray(records)?records:[];
  const q=String(opts.search||opts.q||'').trim().toLowerCase();
  return list.filter((r)=>{
    if(!r||typeof r!=='object') return false;
    if(opts.status!==undefined&&opts.status!==''&&String(r.status??'')!==String(opts.status)) return false;
    if(opts.type!==undefined&&opts.type!==''&&String(r.projectType??r.type??r.plot_type??r.body_type??'')!==String(opts.type)) return false;
    if(!q) return true;
    return Object.values(r).some((v)=> v===false||v===0 ? String(v)===q : String(v??'').toLowerCase().includes(q));
  });
}
function toCSV(records){
  const list=Array.isArray(records)?records:[]; if(!list.length) return '';
  const keys=[...new Set(list.flatMap((r)=>Object.keys(r||{})))];
  const esc=(v)=>{ if(v===null||v===undefined) return ''; const s=typeof v==='object'?JSON.stringify(v):String(v); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  return [keys.join(','), ...list.map((r)=>keys.map((k)=>esc(r[k])).join(','))].join('\n');
}
function createTaskStore(){
  const tasks=new Map(); let seq=1;
  return {
    list(ownerId){ return [...tasks.values()].filter((t)=>String(t.ownerId)===String(ownerId)); },
    create(ownerId, body={}){
      const title=String(body.title||'').trim(); if(!title) throw new Error('title is required');
      const status=['todo','in_progress','done'].includes(body.status)?body.status:'todo';
      const task={id:seq++, ownerId, title, notes:body.notes??'', status, dueDate:body.dueDate??null, createdAt:new Date().toISOString()};
      tasks.set(task.id,task); return task;
    },
    update(ownerId,id,patch={}){
      const t=tasks.get(Number(id)); if(!t||String(t.ownerId)!==String(ownerId)) return null;
      if(patch.title!==undefined){ if(!String(patch.title).trim()) throw new Error('title is required'); t.title=String(patch.title).trim(); }
      if(patch.status!==undefined){ if(!['todo','in_progress','done'].includes(patch.status)) throw new Error('invalid status'); t.status=patch.status; }
      if(patch.notes!==undefined) t.notes=patch.notes; if(patch.dueDate!==undefined) t.dueDate=patch.dueDate;
      return t;
    },
    _clear(){ tasks.clear(); seq=1; }
  };
}
const num=(v)=>{ const n=Number(v); return Number.isFinite(n)?n:0; };

function skillGap(record={}, body={}){
  const required=Array.isArray(record.skills)?record.skills:(typeof record.skills==='string'?record.skills.split(',').map(s=>s.trim()).filter(Boolean):[]);
  const have=new Set((Array.isArray(body.currentSkills)?body.currentSkills:[]).map(s=>String(s).toLowerCase()));
  const missing=required.filter((s)=>!have.has(String(s).toLowerCase()));
  return {pathTitle:record.title||'', requiredSkills:required, missingSkills:missing, matchedCount:required.length-missing.length, hasNoGaps:missing.length===0, summary: missing.length?`Missing: ${missing.join(', ')}`:'No skill gaps on recorded skills', nextSteps: missing.slice(0,5).map((s)=>`Build evidence for ${s}`)};
}
function salaryOutlook(record={}){
  const salary=num(record.avg_salary??record.avgSalary); const growth=num(record.growth_rate??record.growthRate);
  return {pathTitle:record.title||'', avgSalary:salary, growthRate:growth, isUnpaid:salary===0, outlook: growth>=10?'strong growth':growth>0?'positive growth':growth<0?'contracting':'flat / not recorded', summary:`${record.title||'Path'} salary ${salary} growth ${growth}%`};
}
function pathFit(records=[], body={}){
  const list=Array.isArray(records)?records:[]; const interest=String(body.interest||body.industry||'').toLowerCase();
  const matches=list.filter((r)=>!interest||String(r.industry||'').toLowerCase().includes(interest));
  return {recordCount:list.length, matchCount:matches.length, interest:interest||'', hasMatches:matches.length>0, topMatches:matches.slice(0,3).map((r)=>r.title||''), summary:`${matches.length} paths match interest '${interest}'`};
}

module.exports={hasAIKey,filterRecords,toCSV,createTaskStore,skillGap,salaryOutlook,pathFit};
