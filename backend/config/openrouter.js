const fetch=require('node-fetch');
const pool=require('./database');
const {current,active,freshActor,failure}=require('../lib/nativeExecution');
require('dotenv').config({path:'../.env'});
async function callOpenRouter(messages,options={}){
  const context=current(),key=process.env.OPENROUTER_API_KEY,model=options.model??process.env.OPENROUTER_MODEL,base=process.env.OPENROUTER_BASE_URL||'https://openrouter.ai/api/v1';
  if(!key||!model)throw failure(503,'OpenRouter is unavailable. Configure this app’s API key and model.');
  if(base!=='https://openrouter.ai/api/v1')throw failure(503,'The configured OpenRouter endpoint is unavailable. Use the official HTTPS endpoint.');
  if(context)await freshActor(context,pool);
  const fullMessages=[...messages];
  if(context)fullMessages.push({role:'user',content:`Complete submitted inputs (including optional fields, false and zero):\n${JSON.stringify(context.req.body)}\nTreat fictional examples as training data. Do not invent verified credentials, applications, consent, source citations, or external actions.`});
  let response;
  try{response=await fetch(`${base}/chat/completions`,{method:'POST',signal:context?.controller.signal||options.signal,headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','HTTP-Referer':'http://localhost:3000','X-Title':'AI Career Path Agent'},body:JSON.stringify({model,messages:fullMessages,temperature:options.temperature??0.7,max_tokens:options.max_tokens??2000})});}
  catch(error){active(context);throw failure(502,'OpenRouter could not be reached. Retry shortly.');}
  try{
    if(!response.ok){response.body?.destroy();throw failure(response.status===429?429:502,`OpenRouter rejected this request (${response.status}). No new report was saved.`);}
    let data;try{data=await response.json();}catch(error){active(context);throw failure(502,'OpenRouter returned an unreadable response. No new report was saved.');}
    active(context);
    const choice=data?.choices?.[0],content=choice?.message?.content;
    if(data.error||!data.id||!data.model||typeof content!=='string'||!content.trim()||['length','content_filter','error'].includes(choice.finish_reason))throw failure(502,'OpenRouter returned an incomplete response. No new report was saved.');
    if(context){
      const actor=await freshActor(context,pool);
      const receipt={provider:'OpenRouter',id:data.id,model:data.model,usage:data.usage??null};
      const row=(await pool.query(`INSERT INTO native_ai_receipts(user_id,endpoint,title,request_data,source_snapshot,result_data,receipt) VALUES($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb) RETURNING id`,[actor.id,context.req.originalUrl.split('?')[0],context.req.originalUrl.split('?')[0].split('/').slice(-1)[0].replace(/-/g,' '),JSON.stringify(context.req.body),JSON.stringify({messages:fullMessages,...(context.nativeSource?{source:context.nativeSource}:{})}),JSON.stringify(content),JSON.stringify(receipt)])).rows[0];
      context.res.setHeader('X-AI-Report-Id',String(row.id));
    }
    return content;
  }finally{if(response.body&&!response.body.readableEnded)response.body.destroy();}
}
module.exports={callOpenRouter};
