import { Link } from "react-router-dom";
import { formatMinutes } from "../utils/duration";

const getColor = (value) => {
  if (!value) return "#edf1f5";
  if (value <= 30) return "#cfe5db";
  if (value <= 90) return "#8bc4a7";
  if (value <= 180) return "#4c9d77";
  return "#24734f";
};

export default function StudyStats({ weeks = [], stats = {} }) {
  const days = weeks.flat();
  return (
    <div className="d-flex flex-column gap-3 h-100">
      <section className="bg-white rounded-4 p-3 p-lg-4" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
        <div className="mb-3"><h2 className="h6 fw-bold mb-1">Daily activity</h2><p className="small text-secondary mb-0">Actual recorded minutes · last 14 days</p></div>
        {days.length ? <div className="d-flex flex-wrap gap-2">
          {days.map((day) => <div key={day.date} title={`${day.date}: ${formatMinutes(day.minutes || 0)}`} aria-label={`${day.date}: ${formatMinutes(day.minutes || 0)}`} style={{ width: 25, height: 25, borderRadius: 6, background: getColor(day.minutes || 0), border: "1px solid rgba(31,41,55,.06)" }} />)}
        </div> : <p className="small text-secondary mb-0">Activity appears here after your first session.</p>}
        <div className="d-flex align-items-center gap-2 mt-3 small text-secondary"><span>Less</span>{[0, 30, 60, 120, 240].map((value) => <span key={value} style={{ width: 13, height: 13, borderRadius: 3, background: getColor(value) }} />)}<span>More</span></div>
      </section>

      <section className="bg-white rounded-4 p-3 p-lg-4" style={{ border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, .04)" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div><h2 className="h6 fw-bold mb-1">Consistency</h2><p className="small text-secondary mb-0">Calculated from consecutive study dates</p></div>
          <i className="bi bi-fire fs-4" style={{ color: "#df7756" }} />
        </div>
        <div className="d-flex gap-4">
          <div><div className="h3 fw-bold mb-0">{stats.currentStreak || 0}</div><div className="small text-secondary">Current days</div></div>
          <div><div className="h3 fw-bold mb-0">{stats.longestStreak || 0}</div><div className="small text-secondary">Longest run</div></div>
        </div>
      </section>

      <section className="rounded-4 p-3 p-lg-4 text-white h-100" style={{ background: "linear-gradient(145deg, #253f67, #315c83)", boxShadow: "0 8px 22px rgba(37, 63, 103, .14)" }}>
        <div className="small text-uppercase fw-semibold mb-2" style={{ letterSpacing: ".1em", color: "#b9d1e8" }}><i className="bi bi-stars me-2" />AI study workspace</div>
        <h2 className="h6 fw-bold">Want to understand your patterns?</h2>
        <p className="small mb-3" style={{ color: "#d8e6f2" }}>Run an evidence-based analysis of your actual recorded study data.</p>
        <Link to="/ai-insights" className="btn btn-sm btn-light fw-semibold">Open study analysis</Link>
      </section>
    </div>
  );
}
