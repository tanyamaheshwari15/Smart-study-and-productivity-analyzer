import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCharts from "../components/DashboardCharts";
import StudyStats from "../components/StudyStats";
import { api } from "../services/api";
import { formatMinutes } from "../utils/duration";

const Metric = ({ label, value, detail, icon, color }) => (
  <div className="col-6 col-xl-3">
    <div className="h-100 bg-white rounded-4 p-3 p-lg-4" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <span className="small fw-semibold text-secondary">{label}</span>
        <span className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, color, background: `${color}16` }}>
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
      </div>
      <div className="fs-4 fw-bold text-dark">{value}</div>
      <div className="small text-secondary mt-1">{detail}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => setDashboardData(response.data.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const pageStyle = { paddingBottom: 48 };

  if (loading) {
    return <main className="container py-5" style={pageStyle}><div className="placeholder-glow"><span className="placeholder col-5 rounded-3 mb-4" /><span className="placeholder col-12 rounded-4" style={{ height: 120 }} /></div></main>;
  }

  if (error) {
    return <main className="container mt-4" style={pageStyle}><h2>Study overview</h2><div className="alert alert-danger mt-3">{error}</div><button className="btn btn-outline-primary" onClick={() => window.location.reload()}>Try again</button></main>;
  }

  const { stats, profile, studyDistractionData, dsaProgress, weeks, insights, goals, activityLog } = dashboardData;
  const firstName = profile?.username || "there";

  return (
    <main className="container-fluid px-3 px-lg-4 mt-4" style={pageStyle}>
      <section className="rounded-4 p-4 p-lg-5 mb-4 text-white overflow-hidden" style={{ background: "linear-gradient(115deg, #173b68 0%, #235f91 58%, #3182a5 100%)", boxShadow: "0 16px 36px rgba(23, 59, 104, .18)" }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <div className="small text-white-50 text-uppercase fw-semibold mb-2" style={{ letterSpacing: ".12em" }}>Your learning workspace</div>
            <h1 className="display-6 fw-bold mb-2">Welcome back, {firstName}</h1>
            <p className="mb-0 text-white-50">A clear view of your study activity, built from the sessions you have recorded.</p>
          </div>
          <div className="col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end">
            <Link to="/study-timer" className="btn btn-light fw-semibold"><i className="bi bi-play-fill me-1" /> Start studying</Link>
            <Link to="/ai-insights" className="btn btn-outline-light"><i className="bi bi-stars me-1" /> Study analysis</Link>
          </div>
        </div>
      </section>

      <section className="row g-3 mb-4" aria-label="Study metrics">
        <Metric label="Total study time" value={formatMinutes(stats.totalMinutes || 0)} detail={`${stats.totalSessions} recorded sessions`} icon="bi-hourglass-split" color="#3478c8" />
        <Metric label="Today" value={formatMinutes(stats.todayMinutes || 0)} detail="Compared with your previous day" icon="bi-sun" color="#db8b24" />
        <Metric label="This week" value={formatMinutes(stats.weeklyMinutes || 0)} detail="Rolling 7-day total" icon="bi-calendar-week" color="#2e9b78" />
        <Metric label="Current streak" value={`${stats.currentStreak || 0} day${stats.currentStreak === 1 ? "" : "s"}`} detail={`Longest: ${stats.longestStreak || 0} days`} icon="bi-fire" color="#d95f59" />
      </section>

      {stats.totalSessions === 0 && (
        <section className="bg-white rounded-4 p-4 p-lg-5 mb-4 text-center" style={{ border: "1px dashed #b9c5d3" }}>
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, background: "#eef5fb", color: "#235f91" }}><i className="bi bi-journal-plus fs-4" /></div>
          <h2 className="h5 fw-bold">Your study history starts here</h2>
          <p className="text-secondary mb-3">Add a subject, then record a study session. Your dashboard charts and analysis will update from those records.</p>
          <Link to="/subjects" className="btn btn-primary me-2">Add a subject</Link>
          <Link to="/study-timer" className="btn btn-outline-primary">Open timer</Link>
        </section>
      )}

      <section className="row g-3 mb-4">
        <div className="col-xl-7">
          <DashboardCharts studyData={studyDistractionData || []} progressData={dsaProgress || []} />
        </div>
        <div className="col-xl-5">
          <StudyStats weeks={weeks || []} stats={stats} insights={insights} />
        </div>
      </section>

      <section className="row g-3">
        <div className="col-lg-7">
          <div className="bg-white rounded-4 p-4 h-100" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><h2 className="h6 fw-bold mb-1">Recent study sessions</h2><p className="small text-secondary mb-0">Your latest recorded activity</p></div>
              <Link to="/activity-log" className="btn btn-sm btn-outline-secondary">View all</Link>
            </div>
            {activityLog?.length ? (
              <div className="d-flex flex-column">
                {activityLog.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="d-flex align-items-center justify-content-between gap-3 py-3 border-top">
                    <div className="min-w-0"><div className="fw-semibold text-truncate">{activity.type}</div><div className="small text-secondary">{new Date(activity.datetime).toLocaleDateString()} Â· {activity.notes}</div></div>
                    <span className="small fw-semibold text-nowrap">{formatMinutes(activity.durationMinutes || Math.round(activity.duration * 60))}</span>
                  </div>
                ))}
              </div>
            ) : <p className="small text-secondary mb-0">No sessions recorded yet.</p>}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="bg-white rounded-4 p-4 h-100" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><h2 className="h6 fw-bold mb-1">Study goals</h2><p className="small text-secondary mb-0">Progress based on your saved goals</p></div>
              <Link to="/goal" className="btn btn-sm btn-outline-secondary">Manage</Link>
            </div>
            {goals?.length ? goals.slice(0, 4).map((goal) => {
              const progress = goal.targetHours > 0 ? Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100)) : 0;
              return <div key={goal.id} className="mb-3"><div className="d-flex justify-content-between gap-2 small mb-1"><span className="fw-semibold text-truncate">{goal.title}</span><span className="text-secondary text-nowrap">{progress}%</span></div><div className="progress" style={{ height: 7 }}><div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" /></div><div className="small text-secondary mt-1">{formatMinutes(Math.round((goal.completedHours || 0) * 60))} of {formatMinutes(Math.round((goal.targetHours || 0) * 60))}</div></div>;
            }) : <p className="small text-secondary mb-0">No goals yet. Create one to track progress.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
