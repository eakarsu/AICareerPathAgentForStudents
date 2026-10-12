const express=require('express');
const {authenticateToken}=require('../middleware/auth');
const {callOpenRouter}=require('../config/openrouter');
const router=express.Router();router.use(authenticateToken);
router.post('/run',async(req,res)=>{try{if(!req.body||typeof req.body!=='object'||!Object.keys(req.body).length)return res.status(422).json({error:'Provide the planning inputs.'});const content=await callOpenRouter([{role:'system',content:'Draft labor trend follow-ups; no claim that alerts were delivered.'+' Respond with summary, recommendations, uncertainties and next steps. Never invent verified source citations, consents or external actions.'},{role:'user',content:JSON.stringify(req.body)}]);res.json({response:content});}catch(error){res.status(error.status||502).json({error:error.message});}});
router.get('/health',(req,res)=>res.json({ok:true,feature:'Labor trend planning',ai_configured:Boolean(process.env.OPENROUTER_API_KEY&&process.env.OPENROUTER_MODEL)}));
module.exports=router;
