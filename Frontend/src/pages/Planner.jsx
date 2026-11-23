import { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function Planner() {
  const [subjects,setSubjects]=useState([]); const [plans,setPlans]=useState([]); const [activities,setActivities]=useState([]);
  const [loading,setLoading]=useState(true); const [generating,setGenerating]=useState(false); const [error,setError]=useState("");
  const [acceptingPlanId,setAcceptingPlanId]=useState("");
  const generatingPlanRef=useRef(false);
  const acceptingPlanRef=useRef(false);
  const [form,setForm]=useState({title:"",startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+7*86400000).toISOString().slice(0,10),availableHoursPerDay:2,breakMinutes:10,preferredTime:"Evening",subjectIds:[]});
  const load=async()=>{try{const [s,p,a]=await Promise.all([api.get("/subjects"),api.get("/plans"),api.get("/plans/activities")]);setSubjects(s.data.data);setPlans(p.data.data);setActivities(a.data.data);}catch(e){setError(e.response?.data?.message||"Unable to load planner data.");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const generate=async(e)=>{
    e.preventDefault();
    if(generatingPlanRef.current)return;
    generatingPlanRef.current=true;
    setGenerating(true);
    setError("");
    try{await api.post("/plans",form);await load();}
    catch(e){setError(e.response?.data?.message||"Unable to generate plan.");}
    finally{generatingPlanRef.current=false;setGenerating(false);}
  };
  const accept=async(plan)=>{
    if(acceptingPlanRef.current)return;
    acceptingPlanRef.current=true;
    setAcceptingPlanId(plan._id);
    setError("");
    try{await api.put(`/plans/${plan._id}`,{status:"accepted"});await load();}
    catch(e){setError(e.response?.data?.message||"Unable to accept plan.");}
    finally{acceptingPlanRef.current=false;setAcceptingPlanId("");}
  };
  const statusChange=async(activity,status)=>{const reason=window.prompt(`Reason for marking this session ${status}:`);if(reason===null)return;try{const response=await api.put(`/plans/activities/${activity._id}/status`,{status,reason});if(response.data.adaptation?.changes?.length){window.alert(`${response.data.adaptation.summary} ${response.data.adaptation.changes[0].reason}`);}await load();}catch(e){setError(e.response?.data?.message||"Unable to update activity.");}};

  return <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
    <header className="page-heading d-flex justify-content-between align-items-end flex-wrap gap-3"><div><div className="small text-uppercase fw-semibold text-primary mb-2" style={{letterSpacing:".1em"}}>Plan with intention</div><h1 className="h2 mb-1">AI study planner</h1><p>Generate a draft, check every study block, then accept it to add sessions to your schedule.</p></div><span className="badge rounded-pill text-bg-light border py-2 px-3"><i className="bi bi-shield-check me-2 text-success" />Schedule validation enabled</span></header>
    {error&&<div className="alert alert-danger">{error}</div>}
    <div className="row g-4"><div className="col-lg-5"><Card title="Create a study plan" content={<form onSubmit={generate} className="d-flex flex-column gap-3"><input className="form-control" placeholder="Plan title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <div className="row g-2"><div className="col-6"><label className="form-label">Start</label><input className="form-control" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></div><div className="col-6"><label className="form-label">End</label><input className="form-control" type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div></div>
      <div className="row g-2"><div className="col-6"><label className="form-label">Hours/day</label><input className="form-control" type="number" min="0.5" max="16" step="0.5" value={form.availableHoursPerDay} onChange={e=>setForm({...form,availableHoursPerDay:Number(e.target.value)})}/></div><div className="col-6"><label className="form-label">Break minutes</label><input className="form-control" type="number" min="5" max="60" value={form.breakMinutes} onChange={e=>setForm({...form,breakMinutes:Number(e.target.value)})}/></div></div>
      <select className="form-select" value={form.preferredTime} onChange={e=>setForm({...form,preferredTime:e.target.value})}><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select>
      <div><label className="form-label">Subjects</label>{subjects.length?<div className="d-flex flex-column gap-2">{subjects.map(s=><label key={s._id} className="border rounded p-2"><input type="checkbox" className="me-2" checked={form.subjectIds.includes(s._id)} onChange={e=>setForm({...form,subjectIds:e.target.checked?[...form.subjectIds,s._id]:form.subjectIds.filter(id=>id!==s._id)})}/>{s.name}</label>)}</div>:<div className="text-secondary small">Add subjects first.</div>}</div>
      <button className="btn btn-primary" disabled={generating||subjects.length===0||form.subjectIds.length===0}>{generating?"Generating...":"Generate and save draft"}</button></form>}/></div>
      <div className="col-lg-7"><Card title="Saved plans" content={loading?<p>Loading plans...</p>:plans.length?<div className="d-flex flex-column gap-3">{plans.map(plan=><details key={plan._id} open={plan.status==="draft"} className="border rounded p-3"><summary className="fw-semibold">{plan.title} · {plan.status} · {plan.provider}</summary><p className="small text-secondary mt-2 mb-2">{plan.explanation}</p>{plan.sessions.map((s,i)=><div key={i} className="small border-bottom py-2"><strong>{s.subjectName}</strong> · {new Date(s.startAt).toLocaleString()} · {s.durationMinutes} min<br/>{s.objective}</div>)}{plan.status==="draft"&&<button className="btn btn-sm btn-success mt-3" disabled={acceptingPlanId===plan._id} onClick={()=>accept(plan)}>{acceptingPlanId===plan._id?"Accepting...":"Accept plan"}</button>}</details>)}</div>:<p className="text-secondary mb-0">No plans saved yet.</p>}/></div>
    </div>
    <div className="mt-4"><Card title="Upcoming scheduled activities" content={activities.length?<div className="d-flex flex-column gap-2">{activities.map(a=><div key={a._id} className="border rounded p-3 d-flex justify-content-between flex-wrap gap-2"><div><strong>{a.title}</strong><div className="small text-secondary">{new Date(a.startAt).toLocaleString()} · {a.durationMinutes} min · {a.status}</div>{a.reason&&<div className="small">Reason: {a.reason}</div>}</div>{a.status==="planned"&&<div className="d-flex gap-2"><button className="btn btn-sm btn-outline-success" onClick={()=>statusChange(a,"completed")}>Complete</button><button className="btn btn-sm btn-outline-warning" onClick={()=>statusChange(a,"postponed")}>Postpone</button><button className="btn btn-sm btn-outline-danger" onClick={()=>statusChange(a,"missed")}>Missed</button></div>}</div>)}</div>:<p className="text-secondary mb-0">No scheduled activities. Accept a plan to create upcoming activities.</p>}/></div>
  </main>;
}
