import {useEffect,useState} from 'react';
import api from '../services/api';
export default function useCareerTaxonomy(){
 const [roles,setRoles]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);setError('');try{const {data}=await api.get('/custom-views/taxonomy');if(!Array.isArray(data.roles)||data.roles.some(role=>!role.id||!role.title||!Array.isArray(role.skills)))throw Error('Saved role taxonomy returned an invalid list.');setRoles(data.roles);if(!data.roles.length)setError('Create a saved role with named skills in the taxonomy editor first.');}catch(error){setRoles([]);setError(error.response?.data?.error||error.message||'Saved roles could not be loaded.');}finally{setLoading(false);}};
 useEffect(()=>{load();window.addEventListener('career-taxonomy-updated',load);return()=>window.removeEventListener('career-taxonomy-updated',load);},[]);
 return{roles,error,loading,retry:load};
}
