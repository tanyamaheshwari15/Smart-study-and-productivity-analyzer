import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { formatMinutes } from "../utils/duration";

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
      setError("");
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load your goals."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createGoal = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSaving(true); setError("");
    try {
      await api.post("/data/goals", { title: form.get("title"), description: form.get("description"), targetHours: Number(form.get("targetHours")) });
      formElement.reset();
      await load();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to create goal."); }
    finally { setSaving(false); }
  };

  const updateGoal = async (goal, status) => {
    setError("");
    try {
      await api.put(`/data/goals/${goal.id}`, { status, completedHours: status === "completed" ? goal.targetHours : goal.completedHours });
      await load();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update goal."); }
  };

  const deleteGoal = async (goal) => {
    if (!window.confirm(`Delete the goal “${goal.title}”?`)) return;
    setError("");
    try { await api.delete(`/data/goals/${goal.id}`); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete goal."); }
  };

  const goals = data?.goals || [];
  const active = goals.filter((goal) => goal.status === "active").length;
  const completed = goals.filter((goal) => goal.status === "completed").length;
  const progressMinutes = goals.reduce((sum, goal) => sum + Math.round((goal.completedHours || 0) * 60), 0);

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Stay intentional</div><h1 className="h2 mb-1">Study goals</h1><p>Set a target, track recorded progress, and celebrate the work you complete.</p></div>
        <Link to="/planner" className="btn btn-outline-primary"><i className="bi bi-calendar-plus me-2" />Plan a study week</Link>
      </header>
      {error && <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">{error}<button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button></div>}

      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3"><div className="product-surface p-3 p-lg-4"><div className="small text-secondary mb-1">Active goals</div><strong className="fs-3">{active}</strong></div></div>
        <div className="col-6 col-xl-3"><div className="product-surface p-3 p-lg-4"><div className="small text-secondary mb-1">Completed goals</div><strong className="fs-3">{completed}</strong></div></div>
        <div className="col-12 col-xl-6"><div className="product-surface p-3 p-lg-4 d-flex align-items-center justify-content-between gap-3"><div><div className="small text-secondary mb-1">Progress credited to goals</div><strong className="fs-4">{formatMinutes(progressMinutes)}</strong></div><i className="bi bi-bullseye fs-2 text-primary" /></div></div>
      </section>

      <div className="row g-4 align-items-start">
        <section className="col-xl-4">
          <div className="product-surface p-4">
            <div className="d-flex align-items-center gap-3 mb-3"><span className="rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: "#eef5fb", color: "#235f91" }}><i className="bi bi-plus-lg" /></span><div><h2 className="h6 fw-bold mb-1">Create a goal</h2><p className="small text-secondary mb-0">Make a specific, measurable target.</p></div></div>
            <form className="d-flex flex-column gap-3" onSubmit={createGoal}>
              <div><label className="form-label fw-semibold" htmlFor="goal-title">Goal name</label><input id="goal-title" className="form-control" name="title" placeholder="e.g. Review calculus weekly" maxLength="120" required /></div>
              <div><label className="form-label fw-semibold" htmlFor="goal-hours">Target study hours</label><input id="goal-hours" className="form-control" name="targetHours" type="number" min="0.25" max="1000" step="0.25" placeholder="e.g. 5" required /></div>
              <div><label className="form-label fw-semibold" htmlFor="goal-description">Description <span className="text-secondary fw-normal">(optional)</span></label><textarea id="goal-description" className="form-control" name="description" rows="3" maxLength="500" placeholder="What will reaching this goal help you do?" /></div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving goal..." : "Create goal"}</button>
            </form>
          </div>
        </section>
        <section className="col-xl-8">
          <div className="product-surface p-4">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3"><div><h2 className="h6 fw-bold mb-1">Your goals</h2><p className="small text-secondary mb-0">Progress is shown from the values saved for each goal.</p></div><span className="badge rounded-pill text-bg-light border">{goals.length} total</span></div>
            {loading ? <div className="placeholder-glow"><span className="placeholder col-12 mb-3 rounded" /><span className="placeholder col-12 mb-3 rounded" /></div>
              : goals.length ? <div className="d-flex flex-column gap-3">{goals.map((goal) => {
                const progress = goal.targetHours > 0 ? Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100)) : 0;
                return <article key={goal.id} className="border rounded-4 p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="min-w-0"><h3 className="h6 fw-bold mb-1">{goal.title}</h3>{goal.description && <p className="small text-secondary mb-2">{goal.description}</p>}</div>
                    <span className={`badge rounded-pill ${goal.status === "completed" ? "text-bg-success" : goal.status === "paused" ? "text-bg-secondary" : "text-bg-primary"}`}>{goal.status}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-2"><span className="text-secondary">{formatMinutes(Math.round((goal.completedHours || 0) * 60))} of {formatMinutes(Math.round((goal.targetHours || 0) * 60))}</span><strong>{progress}%</strong></div>
                  <div className="progress mb-3" style={{ height: 8 }}><div className={`progress-bar ${goal.status === "completed" ? "bg-success" : ""}`} role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" /></div>
                  <div className="d-flex flex-wrap gap-2">
                    {goal.status !== "completed" && <button className="btn btn-sm btn-outline-success" onClick={() => updateGoal(goal, "completed")}><i className="bi bi-check2 me-1" />Mark complete</button>}
                    {goal.status === "active" && <button className="btn btn-sm btn-outline-secondary" onClick={() => updateGoal(goal, "paused")}>Pause</button>}
                    {goal.status === "paused" && <button className="btn btn-sm btn-outline-primary" onClick={() => updateGoal(goal, "active")}>Resume</button>}
                    <button className="btn btn-sm btn-outline-danger ms-sm-auto" onClick={() => deleteGoal(goal)}>Delete</button>
                  </div>
                </article>;
              })}</div>
              : <div className="text-center p-5"><div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 54, height: 54, color: "#235f91", background: "#eef5fb" }}><i className="bi bi-bullseye fs-5" /></div><h3 className="h6 fw-bold">Your next goal starts here</h3><p className="small text-secondary mb-0">Use the form to set a meaningful study target.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
