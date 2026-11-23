import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard");
        setData(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || !data) {
    return <div className="container mt-4" style={{ position: "relative", top: 59 }}><h2>Goals & Performance</h2><p>Loading goals...</p></div>;
  }

  const activeGoals = data.goals || [];
  const completion = activeGoals.length ? Math.round((activeGoals.filter((g) => g.status === "completed").length / activeGoals.length) * 100) : 0;

  const createGoal = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/data/goals", { title: form.get("title"), description: form.get("description"), targetHours: Number(form.get("targetHours")) });
    const response = await api.get("/dashboard");
    setData(response.data.data);
    event.currentTarget.reset();
  };

  const updateGoal = async (goal, status) => {
    await api.put(`/data/goals/${goal.id}`, { status, completedHours: status === "completed" ? goal.targetHours : goal.completedHours });
    const response = await api.get("/dashboard");
    setData(response.data.data);
  };

  const deleteGoal = async (goal) => {
    await api.delete(`/data/goals/${goal.id}`);
    const response = await api.get("/dashboard");
    setData(response.data.data);
  };

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: "40px" }}>
      <div className="mb-2">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#2c3e50", marginBottom: "0.5rem" }}>Goals & Performance</h2>
        <p style={{ color: "#7f8c8d", marginBottom: 0 }}>Track your study goals and academic progress</p>
      </div>

      <div className="d-flex gap-4 justify-content-center flex-wrap">
        <Card width="380px" height="120px" icon="🎯" title="Active Goals" content={<div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#3498db" }}>{activeGoals.length}</div>} />
        <Card width="380px" height="120px" icon="✅" title="Completion Ratio" content={<div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#27ae60" }}>{completion}%</div>} />
        <Card width="380px" height="120px" icon="🔥" title="Longest Streak" content={<div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#e74c3c" }}>{data.profile?.streak || 0} <span style={{ fontSize: "0.8rem" }}>days</span></div>} />
      </div>

      <div className="d-flex gap-4 justify-content-center flex-wrap">
        <Card width="500px" height="160px" icon="🎓" title="Current Focus Topic" content={<p style={{ fontSize: "1.1rem", fontWeight: 500, color: "#2c3e50", marginBottom: 0 }}>{data.profile?.bestTopic || "Arrays"}</p>} />
        <Card width="500px" height="160px" icon="🏆" title="Goals Completed" content={<p style={{ fontSize: "1.1rem", fontWeight: 500, color: "#2c3e50", marginBottom: 0 }}>{data.profile?.goalsCompleted || 0} goals finished</p>} />
      </div>

      <div className="d-flex justify-content-center">
        <Card width="100%" height="auto" icon="📋" title="Active Study Goals" content={
          <div>
            <form className="row g-2 mb-3" onSubmit={createGoal}>
              <div className="col-md-5"><input className="form-control" name="title" placeholder="Goal title" required /></div>
              <div className="col-md-3"><input className="form-control" name="targetHours" type="number" min="1" placeholder="Target hours" required /></div>
              <div className="col-md-4"><input className="form-control" name="description" placeholder="Description" /></div>
              <div className="col-12"><button className="btn btn-primary btn-sm" type="submit">Create Goal</button></div>
            </form>
            {activeGoals.length === 0 ? (
              <p style={{ color: "#95a5a6", fontStyle: "italic" }}>No active goals yet. Create one to start!</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activeGoals.map((goal) => (
                  <div key={goal.id || goal.title} style={{ borderLeft: "4px solid #3498db", paddingLeft: "12px", paddingBottom: "8px" }}>
                    <div style={{ fontWeight: 600, color: "#2c3e50", marginBottom: "4px" }}>{goal.title}</div>
                    <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                      <span style={{ display: "inline-block", marginRight: "16px" }}>Progress: {goal.completedHours}/{goal.targetHours} hrs</span>
                      <span className="badge" style={{ background: goal.status === "completed" ? "#27ae60" : "#3498db" }}>{goal.status}</span>
                    </div>
                    <div style={{ background: "#ecf0f1", height: "6px", borderRadius: "3px", marginTop: "6px" }}>
                      <div style={{ background: goal.status === "completed" ? "#27ae60" : "#3498db", height: "100%", borderRadius: "3px", width: `${goal.targetHours ? Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100)) : 0}%`, transition: "width 0.3s ease" }}></div>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-success" onClick={() => updateGoal(goal, "completed")}>Complete</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => updateGoal(goal, "paused")}>Pause</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteGoal(goal)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        } />
      </div>
    </div>
  );
}
