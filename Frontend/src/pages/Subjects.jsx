import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name:"", difficulty:3, priority:3, weeklyTargetMinutes:120, examDate:"", color:"#6ea0b5" });

  const load = async () => {
    setLoading(true);
    try { setSubjects((await api.get("/subjects")).data.data); }
    catch (err) { setError(err.response?.data?.message || "Unable to load subjects."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault(); setError("");
    try {
      await api.post("/subjects", { ...form, examDate: form.examDate || null });
      setForm({ name:"", difficulty:3, priority:3, weeklyTargetMinutes:120, examDate:"", color:"#6ea0b5" });
      await load();
    } catch (err) { setError(err.response?.data?.message || "Unable to save subject."); }
  };

  const remove = async (subject) => {
    if (!window.confirm(`Delete ${subject.name}? Existing sessions and plans will keep their recorded text where possible.`)) return;
    try { await api.delete(`/subjects/${subject._id}`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to delete subject."); }
  };

  return <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
    <header className="page-heading"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{letterSpacing:".1em"}}>Organize your learning</div><h1 className="h2 mb-1">Subjects</h1><p>Set difficulty, priority, weekly study targets, and exam dates to inform your sessions and study plans.</p></header>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="row g-4">
      <div className="col-lg-5"><Card title="Add a subject" content={<form onSubmit={submit} className="d-flex flex-column gap-3">
        <div><label className="form-label" htmlFor="subject-name">Subject name</label><input id="subject-name" name="name" className="form-control" placeholder="e.g. Mathematics" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></div>
        <div className="row g-2"><div className="col-6"><label className="form-label" htmlFor="subject-difficulty">Difficulty</label><select id="subject-difficulty" name="difficulty" className="form-select" value={form.difficulty} onChange={(e)=>setForm({...form,difficulty:Number(e.target.value)})}>{[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}</select></div><div className="col-6"><label className="form-label" htmlFor="subject-priority">Priority</label><select id="subject-priority" name="priority" className="form-select" value={form.priority} onChange={(e)=>setForm({...form,priority:Number(e.target.value)})}>{[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}</select></div></div>
        <div><label className="form-label" htmlFor="subject-weekly-target">Weekly target (minutes)</label><input id="subject-weekly-target" name="weeklyTargetMinutes" className="form-control" type="number" min="0" max="10080" value={form.weeklyTargetMinutes} onChange={(e)=>setForm({...form,weeklyTargetMinutes:Number(e.target.value)})}/></div>
        <div><label className="form-label" htmlFor="subject-exam-date">Exam date</label><input id="subject-exam-date" name="examDate" className="form-control" type="date" value={form.examDate} onChange={(e)=>setForm({...form,examDate:e.target.value})}/></div>
        <div><label className="form-label" htmlFor="subject-color">Color</label><input id="subject-color" name="color" className="form-control form-control-color" type="color" value={form.color} onChange={(e)=>setForm({...form,color:e.target.value})}/></div>
        <button className="btn btn-primary" disabled={loading}>Save subject</button>
      </form>}/></div>
      <div className="col-lg-7"><Card title="Your subjects" content={loading ? <p>Loading subjects...</p> : subjects.length ? <div className="d-flex flex-column gap-2">{subjects.map(subject=><div key={subject._id} className="d-flex align-items-center justify-content-between border rounded p-3"><div><strong>{subject.name}</strong><div className="small text-secondary">Difficulty {subject.difficulty} · Priority {subject.priority}{subject.examDate ? ` · Exam ${new Date(subject.examDate).toLocaleDateString()}` : ""}</div></div><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(subject)}>Delete</button></div>)}</div> : <p className="text-secondary mb-0">No subjects yet. Add the subjects you are studying.</p>}/></div>
    </div>
  </main>;
}
