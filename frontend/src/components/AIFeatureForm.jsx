import React, {useEffect, useId, useRef, useState} from 'react';
import AIResponseDisplay from './AIResponseDisplay';
import FeedbackWidget from './FeedbackWidget';
import {careerExample,careerScenarios,requestValues} from './CareerExamples';

export default function AIFeatureForm({title,icon,description,fields,onSubmit,endpoint,compact=false}) {
  const missingSource=fields.find(field=>field.required&&field.sourceReference&&!(field.options||[]).length);
  const [formData,setFormData]=useState({}),[loading,setLoading]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[submitted,setSubmitted]=useState(null);
  const active=useRef(null),sequence=useRef(0),id=useId();
  const change=(key,value)=>{setFormData(current=>({...current,[key]:value}));setResult(null);setSubmitted(null);};
  const cancel=()=>{sequence.current++;active.current?.abort();active.current=null;setLoading(false);setNotice('Request cancelled. Reports completed before cancellation remain in AI History.');};
  useEffect(()=>{setFormData({});setResult(null);setError('');setNotice('');return()=>{sequence.current++;active.current?.abort();};},[endpoint]);
  const fill=index=>{try{setFormData(careerExample(fields,index,formData));setError('');setNotice('Every editable field is filled, including optional fields. Existing structured source data and saved-record selections are preserved. Review this fictional practice example before generating.');}catch(err){setError(err.message);}};
  const submit=async event=>{
    event?.preventDefault();if(loading)return;if(missingSource){setError(`Load or create an actual owned ${missingSource.label.toLowerCase()} before generating.`);return;}
    const generation=++sequence.current,controller=new AbortController();active.current=controller;setLoading(true);setError('');setNotice('');setResult(null);
    try{const payload=requestValues(fields,formData);const data=await onSubmit(payload,{signal:controller.signal});if(!controller.signal.aborted&&generation===sequence.current){setSubmitted(payload);setResult(data);}}
    catch(err){if(!controller.signal.aborted&&generation===sequence.current)setError(err.response?.data?.error||err.response?.data?.errors?.map(e=>e.msg).join('; ')||err.message||'AI request failed');}
    finally{if(generation===sequence.current){active.current=null;setLoading(false);}}
  };
  return <section className={compact?'career-ai-workspace':'feature-page'} aria-label={title}>
    {!compact&&<div className="page-header"><div className="page-title"><span className="page-icon">{icon}</span><div><h1>{title}</h1><p>{description}</p></div></div></div>}
    <div className="ai-panel"><div className="ai-panel-body"><form onSubmit={submit}>
      <div className="career-example-toolbar" aria-label="Fill all AI fields"><p>Demo AI fills the whole form, including optional fields. Examples are fictional. Supplied structured source data and saved-record selections are preserved; no experience, eligibility, or market facts are verified.</p>
        <div className="career-action-row">{careerScenarios.map((scenario,index)=><button type="button" className="btn btn-secondary" disabled={loading} key={scenario} onClick={()=>fill(index)}>Demo AI · {scenario}</button>)}</div>
      </div>
      {fields.map(field=>{const controlId=`${id}-${field.key}`,common={id:controlId,name:field.key,required:field.required,disabled:loading,value:formData[field.key]??'',onChange:event=>change(field.key,event.target.value),placeholder:field.placeholder};return <div className="form-group" key={field.key}><label htmlFor={controlId}>{field.label}{field.required?' *':' (optional)'}</label>
        {['textarea','array_json'].includes(field.type)?<textarea {...common} rows={field.rows||3}/>:field.type==='select'?<select {...common}><option value="">Select…</option>{field.options?.map(option=><option key={typeof option==='object'?option.value:option} value={typeof option==='object'?option.value:option}>{typeof option==='object'?option.label:option}</option>)}</select>:field.type==='checkbox'?<input id={controlId} name={field.key} type="checkbox" disabled={loading} checked={Boolean(formData[field.key])} onChange={event=>change(field.key,event.target.checked)}/>:<input {...common} type={field.type==='number'?'number':'text'} min={field.min} max={field.max} step={field.step}/>}
        {field.help&&<small>{field.help}</small>}</div>;})}
      {missingSource&&<p role="alert">Load or create an actual owned {missingSource.label.toLowerCase()} before generating. No record ID will be invented.</p>}
      <div className="career-action-row"><button className="btn btn-ai" type="submit" disabled={loading||Boolean(missingSource)}>{loading?'Generating…':'Generate with OpenRouter'}</button><button className="btn btn-secondary" type="button" onClick={cancel} disabled={!loading}>Cancel</button></div>
    </form></div>
    {notice&&<p role="status" className="career-notice">{notice}</p>}
    {error&&<div role="alert" className="error-message">{error}<button type="button" className="btn btn-secondary" disabled={loading} onClick={submit}>Retry</button></div>}
    {result!==null&&<><AIResponseDisplay content={result} title={`AI ${title}`}/>{endpoint&&<FeedbackWidget endpoint={endpoint} requestData={submitted||{}}/>}</>}
    </div>
  </section>;
}
