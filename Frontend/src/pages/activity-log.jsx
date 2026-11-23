import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { formatMinutes } from "../utils/duration";

export default function ActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setError("");
    try {
      const response = await api.get("/dashboard");
      setEntries(response.data.data.activityLog || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load sessions.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === "All" ? entries : entries.filter((entry) => entry.type === filter), [entries, filter]);
  const totalMinutes = filtered.reduce((sum, entry) => sum + (entry.durationMinutes ?? Math.round((entry.duration || 0) * 60)), 0);

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Your history</div><h1 className="h2 mb-1">Study sessions</h1><p>A reliable record of your completed study blocks.</p></div>
        <Link to="/study-timer" className="btn btn-primary"><i className="bi bi-play-fill me-2" />Start a session</Link>
      </header>
      {error && <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">{error}<button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button></div>}

      <section className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3"><div className="product-surface p-3"><div className="small text-secondary mb-1">Sessions shown</div><strong className="fs-4">{filtered.length}</strong></div></div>
        <div className="col-sm-6 col-xl-3"><div className="product-surface p-3"><div className="small text-secondary mb-1">Study time shown</div><strong className="fs-5">{formatMinutes(totalMinutes)}</strong></div></div>
      </section>

      <section className="product-surface overflow-hidden">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap p-3 p-lg-4 border-bottom">
          <div><h2 className="h6 fw-bold mb-1">Session history</h2><p className="small text-secondary mb-0">Filter by a subject to review your study activity.</p></div>
          <label className="visually-hidden" htmlFor="activity-subject-filter">Filter sessions by subject</label>
          <select id="activity-subject-filter" name="subjectFilter" className="form-select" value={filter} onChange={(event) => setFilter(event.target.value)} style={{ width: "auto", minWidth: 180 }}>
            <option>All</option>{Array.from(new Set(entries.map((entry) => entry.type))).map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
        {loading ? <div className="p-4"><div className="placeholder-glow"><span className="placeholder col-12 mb-3 rounded" /><span className="placeholder col-12 mb-3 rounded" /><span className="placeholder col-10 rounded" /></div></div>
          : filtered.length ? <div className="table-responsive"><table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th scope="col">Date & time</th><th scope="col">Subject</th><th scope="col">Duration</th><th scope="col">Focus</th>            <th scope="col">Distraction events</th></tr></thead>
            <tbody>{filtered.map((entry) => {
              const focus = Number(entry.focusScore ?? entry.notes?.match(/(\d+)% focus/)?.[1] ?? 0);
              const distraction = Number(entry.distractionMinutes ?? entry.notes?.match(/(\d+) mins distraction/)?.[1] ?? 0);
              return <tr key={entry._id || entry.datetime}>
                <td className="text-secondary text-nowrap">{new Date(entry.datetime).toLocaleString()}</td>
                <td><span className="badge rounded-pill text-bg-light border text-dark">{entry.type}</span></td>
                <td className="fw-semibold text-nowrap">{formatMinutes(entry.durationMinutes ?? Math.round((entry.duration || 0) * 60))}</td>
                <td><span className="fw-semibold">{focus}%</span><div className="progress mt-1" style={{ height: 5, maxWidth: 100 }}><div className="progress-bar" style={{ width: `${focus}%` }} /></div></td>
                <td className="text-secondary">{distraction}</td>
              </tr>;
            })}</tbody>
          </table></div>
          : <div className="text-center p-5"><div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 52, height: 52, background: "#eef5fb", color: "#235f91" }}><i className="bi bi-journal-text fs-5" /></div><h3 className="h6 fw-bold">No sessions to show</h3><p className="text-secondary small mb-3">{entries.length ? "No session matches this subject filter." : "Your saved study sessions will appear here."}</p>{entries.length ? <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilter("All")}>Clear filter</button> : <Link to="/study-timer" className="btn btn-sm btn-primary">Start studying</Link>}</div>}
      </section>
    </main>
  );
}
