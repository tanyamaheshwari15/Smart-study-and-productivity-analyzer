import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { formatMinutes } from "../utils/duration";

export default function Leaderboard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => setProfile(response.data.data.profile))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your study summary."));
  }, []);

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Your progress</div><h1 className="h2 mb-1">Study summary</h1><p>A personal snapshot of your logged study activity. No community ranking is shown because this app does not yet have a verified shared leaderboard.</p></header>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!profile ? !error && <div className="product-surface p-4 placeholder-glow"><span className="placeholder col-5 rounded" /></div> : <div className="row g-4">
        <div className="col-xl-4">
          <section className="rounded-4 p-4 p-lg-5 text-white h-100" style={{ background: "linear-gradient(145deg,#173b68,#3182a5)" }}>
            <div className="small text-uppercase fw-semibold mb-3" style={{ letterSpacing: ".1em", color: "#b9d1e8" }}>Consistency over comparison</div>
            <div className="display-4 fw-bold mb-1">{profile.streak || 0}</div><div className="mb-4" style={{ color: "#d8e6f2" }}>consecutive study days</div>
            <p className="small mb-0" style={{ color: "#d8e6f2" }}>A streak counts consecutive days with at least one saved study session.</p>
          </section>
        </div>
        <div className="col-xl-8">
          <section className="product-surface p-4 p-lg-5 h-100">
            <h2 className="h6 fw-bold mb-4">Your recorded milestones</h2>
            <div className="row g-3">
              {[
                ["Study time logged", formatMinutes(Math.round((profile.studyHours || 0) * 60)), "bi-hourglass-split", "From completed sessions saved to your account."],
                ["Longest streak", `${profile.longestStreak || 0} days`, "bi-fire", "Longest consecutive run in your saved session history."],
                ["Average focus", profile.focusScore ? `${profile.focusScore}%` : "No data", "bi-bullseye", "Average self-reported focus score across sessions."],
                ["Goals completed", profile.goalsCompleted || 0, "bi-check2-circle", "Goals marked complete in your account."],
              ].map(([label, value, icon, note]) => <div key={label} className="col-sm-6"><div className="rounded-4 p-3 h-100" style={{ background: "#f6f8fb" }}><div className="d-flex align-items-center gap-2 text-secondary small mb-2"><i className={`bi ${icon} text-primary`} />{label}</div><div className="fs-4 fw-bold mb-1">{value}</div><div className="small text-secondary">{note}</div></div></div>)}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4"><Link to="/activity-log" className="btn btn-outline-secondary">Review sessions</Link><Link to="/goal" className="btn btn-primary">View study goals</Link></div>
          </section>
        </div>
      </div>}
    </main>
  );
}
