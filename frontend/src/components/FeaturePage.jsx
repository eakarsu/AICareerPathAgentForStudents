import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import axios from 'axios';
import DetailModal from './DetailModal';
import FormModal from './FormModal';
import AIFeatureForm from './AIFeatureForm';
const readable=value=>value===null||value===undefined||value===''?'Not provided':typeof value==='object'?JSON.stringify(value):String(value);
const errorMessage=error=>error.response?.data?.error||error.response?.data?.errors?.map(e=>e.msg).join('; ')||error.message||'Request failed';
export default function FeaturePage({title,icon,apiEndpoint,fields,displayFields,cardTitleField,aiFeature}){
  const [items,setItems]=useState([]),[selected,setSelected]=useState(null),[editing,setEditing]=useState(undefined),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[formError,setFormError]=useState(''),[showAI,setShowAI]=useState(false),[search,setSearch]=useState('');
  const controller=useRef(null),token=localStorage.getItem('token'),headers=useMemo(()=>({Authorization:`Bearer ${token}`}),[token]);
  const load=useCallback(async()=>{
    controller.current?.abort();const current=new AbortController();controller.current=current;setLoading(true);setError('');
    try{const {data}=await axios.get(`/api/${apiEndpoint}`,{headers,signal:current.signal,params:{limit:100}});const rows=Array.isArray(data)?data:data?.data;if(!Array.isArray(rows)||rows.some(row=>!row||row.id===undefined))throw new Error('The server returned an invalid record list.');if(!current.signal.aborted)setItems(rows);}
    catch(err){if(!current.signal.aborted)setError(errorMessage(err));}finally{if(!current.signal.aborted)setLoading(false);}
  },[apiEndpoint,headers]);
  useEffect(()=>{load();return()=>controller.current?.abort();},[load]);
  const open=async item=>{setError('');try{const {data}=await axios.get(`/api/${apiEndpoint}/${item.id}`,{headers});const actual=data?.data??data?.item??data;if(!actual||actual.id!==item.id)throw new Error('The record could not be loaded.');setSelected(actual);}catch(err){setError(errorMessage(err));}};
  const remove=async id=>{if(!window.confirm('Delete this saved record?'))return;setError('');try{await axios.delete(`/api/${apiEndpoint}/${id}`,{headers});setSelected(null);await load();}catch(err){setError(errorMessage(err));}};
  const save=async values=>{setSaving(true);setFormError('');const payload=Object.fromEntries(fields.filter(field=>!field.readOnly).map(field=>[field.key,values[field.key]??'']));try{if(editing?.id)await axios.put(`/api/${apiEndpoint}/${editing.id}`,payload,{headers});else await axios.post(`/api/${apiEndpoint}`,payload,{headers});setEditing(undefined);await load();}catch(err){setFormError(errorMessage(err));}finally{setSaving(false);}};
  const edit=item=>{if(item.canEdit===false){setError(item.recordNotice||'This record is retained for review.');return;}setSelected(null);setFormError('');setEditing(item);};
  const filtered=items.filter(item=>!search||Object.values(item).some(value=>typeof value==='string'&&value.toLowerCase().includes(search.toLowerCase())));
  return <section className="feature-page"><div className="page-header"><div className="page-title"><span className="page-icon">{icon}</span><div><h1>{title}</h1><p>{loading?'Loading records…':error?'Records unavailable':`${filtered.length} records`}</p></div></div><div className="page-actions">{aiFeature&&<button className="btn btn-ai" onClick={()=>setShowAI(!showAI)}>AI {aiFeature.label}</button>}<button className="btn btn-primary" onClick={()=>{setFormError('');setEditing(null);}}>+ New Item</button></div></div>
    <div className="search-bar"><input aria-label="Search records" placeholder="Search…" value={search} onChange={event=>setSearch(event.target.value)}/></div>
    {showAI&&aiFeature&&<div className="ai-panel"><div className="ai-panel-header"><h3>{aiFeature.label}</h3><button className="btn-close" aria-label="Close AI form" onClick={()=>setShowAI(false)}>×</button></div><AIFeatureForm compact title={aiFeature.label} fields={aiFeature.fields} endpoint={`/${apiEndpoint}/${aiFeature.endpoint}`} onSubmit={async(payload,config)=>(await axios.post(`/api/${apiEndpoint}/${aiFeature.endpoint}`,payload,{...config,headers})).data}/></div>}
    {error&&<div role="alert" className="error-message">{error}<button className="btn btn-secondary" onClick={load}>Retry</button></div>}
    {loading?<p role="status">Loading saved records…</p>:!error&&!filtered.length?<p>No matching records. Create a draft or adjust your search.</p>:<div className="data-table-container"><table className="data-table"><thead><tr><th>#</th>{displayFields.map(field=><th key={field.key}>{field.label}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map((item,index)=><tr key={item.id} className="table-row-clickable" onClick={()=>open(item)}><td>{index+1}</td>{displayFields.map(field=><td key={field.key}>{readable(item[field.key]).slice(0,100)}{item.is_demo&&field.key===displayFields[0]?.key&&<small className="career-record-muted"> · Fictional training draft</small>}</td>)}<td><div className="row-actions" onClick={event=>event.stopPropagation()}><button className="btn-icon" title="Open details" aria-label={`Open record ${item.id}`} onClick={()=>open(item)}>↗</button><button className="btn-icon btn-edit" title="Edit" disabled={item.canEdit===false} onClick={()=>edit(item)}>✎</button><button className="btn-icon btn-delete" title="Delete" disabled={item.canDelete===false} onClick={()=>remove(item.id)}>⌫</button></div></td></tr>)}</tbody></table></div>}
    {selected&&<DetailModal item={selected} fields={fields} title={selected[cardTitleField]||title} onClose={()=>setSelected(null)} onEdit={edit} onDelete={remove}/>}
    {editing!==undefined&&<FormModal item={editing} fields={fields} title={title} saving={saving} error={formError} onClose={()=>{if(!saving)setEditing(undefined);}} onSave={save}/>}
  </section>;
}
