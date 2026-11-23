import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { formatMinutes } from "../utils/duration";

export default function StudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [focusScore, setFocusScore] = useState(80);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const startedAt = useRef(null);

  useEffect(() => {
    api.get("/subjects")
      .then((response) => setSubjects(response.data.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load subjects. Refresh and try again."));
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const toggle = () => {
    if (!running && seconds === 0) startedAt.current = new Date();
    setRunning((value) => !value);
    setMessage("");
  };

  const reset = () => {
    if (seconds > 0 && !window.confirm("Discard this unsaved timer session?")) return;
    setRunning(false);
    setSeconds(0);
    setDistractions(0);
    setMessage("");
    setError("");
    startedAt.current = null;
  };

  const saveSession = async () => {
    setError("");
    setMessage("");
    if (running) { setError("Pause the timer before saving your session."); return; }
    if (seconds < 1) { setError("Start the timer to record a session."); return; }
    if (!subjectId) { setError("Choose a subject to associate with this session."); return; }
    setSaving(true);
    try {
      await api.post("/data/sessions", {
        subjectId,
        durationMinutes: Math.max(1, Math.round(seconds / 60)),
        distractionMinutes: distractions,
        focusScore: Number(focusScore),
        notes: "Saved from study timer",
        date: startedAt.current || new Date(),
      });
      setMessage(`Session saved · ${formatMinutes(Math.max(1, Math.round(seconds / 60)))}`);
      setSeconds(0);
      setDistractions(0);
      setRunning(false);
      startedAt.current = null;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this session. Your timer is still available.");
    } finally { setSaving(false); }
  };

  const time = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, "0")).join(":");
  const selectedSubject = subjects.find((subject) => subject._id === subjectId);

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Focus mode</div><h1 className="h2 mb-1">Study timer</h1><p>Set a subject, focus on one block, and save the time you actually studied.</p></div>
        <Link to="/activity-log" className="btn btn-outline-secondary"><i className="bi bi-clock-history me-2" />Session history</Link>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="row g-4 align-items-stretch">
        <div className="col-xl-8">
          <section className="product-surface p-4 p-md-5 h-100 text-center">
            <div className="small fw-semibold text-uppercase text-secondary mb-4" style={{ letterSpacing: ".12em" }}>{selectedSubject?.name || "Choose a subject to begin"}</div>
            <div className="timer-face fw-bold mb-4" style={{ fontSize: "clamp(3.6rem, 11vw, 7rem)", lineHeight: 1.1 }} aria-live="off">{time}</div>
            <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
              <button type="button" className={`btn px-4 ${running ? "btn-outline-primary" : "btn-primary"}`} onClick={toggle} disabled={!subjects.length}>
                <i className={`bi ${running ? "bi-pause-fill" : "bi-play-fill"} me-2`} />{running ? "Pause focus" : seconds ? "Resume session" : "Start focus"}
              </button>
              <button type="button" className="btn btn-outline-secondary px-4" onClick={reset} disabled={seconds === 0}><i className="bi bi-arrow-counterclockwise me-2" />Reset</button>
              <button type="button" className="btn btn-success px-4" onClick={saveSession} disabled={saving || running || seconds === 0}>{saving ? "Saving..." : <><i className="bi bi-check2 me-2" />Save session</>}</button>
            </div>
            {!subjects.length && <div className="alert alert-light border mx-auto text-start" style={{ maxWidth: 480 }}>Create a subject first to record a focused session. <Link to="/subjects">Add a subject</Link>.</div>}
            <div className="row g-3 pt-3 border-top text-start">
              <div className="col-md-6">
                <label htmlFor="timer-subject" className="form-label fw-semibold">Study subject</label>
                <select id="timer-subject" className="form-select" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} disabled={running}>
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="focus-score" className="form-label fw-semibold d-flex justify-content-between"><span>How focused were you?</span><span>{focusScore}%</span></label>
                <input id="focus-score" className="form-range mt-2" type="range" min="0" max="100" step="5" value={focusScore} onChange={(event) => setFocusScore(event.target.value)} />
              </div>
            </div>
          </section>
        </div>
        <div className="col-xl-4">
          <div className="product-surface p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, color: "#b7791f", background: "#fff5db" }}><i className="bi bi-bell fs-5" /></span>
              <div><h2 className="h6 fw-bold mb-1">Distraction check-in</h2><p className="small text-secondary mb-0">Count distraction events for this block</p></div>
            </div>
            <div className="d-flex align-items-end justify-content-between border-bottom pb-3 mb-3">
              <span className="text-secondary">Logged distractions</span><strong className="fs-3">{distractions}</strong>
            </div>
            <button type="button" className="btn btn-outline-warning w-100" onClick={() => setDistractions((value) => value + 1)} disabled={!running}><i className="bi bi-plus-circle me-2" />Log a distraction</button>
            <div className="rounded-3 p-3 mt-4" style={{ background: "#f4f7fb" }}>
              <div className="small fw-semibold text-dark mb-1"><i className="bi bi-lightbulb me-2 text-warning" />A gentle reminder</div>
              <p className="small text-secondary mb-0">Distractions are a reflection of the study environment, not a measure of your ability.</p>
            </div>
            <div className="small text-secondary mt-4"><i className="bi bi-shield-check me-2 text-success" />This timer runs in your browser. Save before closing the page.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
