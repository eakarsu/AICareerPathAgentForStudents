import React from 'react';
import AIReport from './AIReport';
export default function AIResponseDisplay({content,title}) {
  if(content===undefined||content===null||content==='')return null;
  return <div className="ai-response-container"><div className="ai-response-header"><div className="ai-badge">AI guidance · review before relying on it</div>{title&&<h3 className="ai-response-title">{title}</h3>}</div><AIReport response={content} title={title||'AI guidance'}/></div>;
}
