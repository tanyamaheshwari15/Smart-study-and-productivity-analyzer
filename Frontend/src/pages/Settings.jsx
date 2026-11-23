import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearSession, getStoredUser } from "../services/api";

const initialSettings = { notifications: true, studyGoalHours: 2, preferredTime: "Evening", availableHours: 2, breakMinutes: 10 };

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const user = getStoredUser() || {};

  useEffect(() => {
    api.get("/dashboard").then((response) => setSettings({
      notifications: response.data.data.settings.notifications,
      studyGoalHours: response.data.data.settings.studyGoalHours,
      preferredTime: response.data.data.settings.preferredTime,
      availableHours: response.data.data.settings.availableHours,
      breakMinutes: response.data.data.settings.breakMinutes,
    })).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load preferences."))
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) => { setSettings((current) => ({ ...current, [key]: value })); setSaved(false); };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      await api.put("/data/preferences", {
        notifications: settings.notifications,
        dailyGoalMinutes: Math.round(Number(settings.studyGoalHours) * 60),
        preferredTime: settings.preferredTime,
        availableHours: Number(settings.availableHours),
        breakMinutes: Number(settings.breakMinutes),
      });
      setSaved(true);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save preferences."); }
    finally { setSaving(false); }
  };

  const logout = () => { clearSession(); navigate("/"); };
  const deleteAccount = async () => {
    if (!window.confirm("Permanently delete your account and all associated study records? This cannot be undone.")) return;
    setError("");
    try { await api.delete("/data/account"); clearSession(); navigate("/"); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete your account."); }
  };

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Make it yours</div><h1 className="h2 mb-1">Settings</h1><p>Set a study rhythm that the planner can use when it builds your schedule.</p></header>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {saved && <div className="alert alert-success" role="status">Your study preferences have been saved.</div>}
      <div className="row g-4 align-items-start">
        <div className="col-xl-8">
          <form onSubmit={save} className="product-surface p-4 p-lg-5">
            <div className="d-flex align-items-center gap-3 mb-4"><span className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, color: "#235f91", background: "#eef5fb" }}><i className="bi bi-sliders fs-5" /></span><div><h2 className="h6 fw-bold mb-1">Study preferences</h2><p className="small text-secondary mb-0">Used to personalize your AI study plan.</p></div></div>
            {loading ? <div className="placeholder-glow"><span className="placeholder col-8 rounded" /></div> : <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="daily-goal">Daily study goal (hours)</label><input id="daily-goal" className="form-control" type="number" min="0" max="24" step="0.5" value={settings.studyGoalHours} onChange={(event) => update("studyGoalHours", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="availability">Available hours per day</label><input id="availability" className="form-control" type="number" min="0" max="16" step="0.5" value={settings.availableHours} onChange={(event) => update("availableHours", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="preferred-time">Preferred study time</label><select id="preferred-time" className="form-select" value={settings.preferredTime} onChange={(event) => update("preferredTime", event.target.value)}><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></div>
              <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="break-time">Break between study blocks (minutes)</label><input id="break-time" className="form-control" type="number" min="5" max="60" step="5" value={settings.breakMinutes} onChange={(event) => update("breakMinutes", event.target.value)} /></div>
              <div className="col-12"><div className="form-check form-switch mt-2"><input id="notifications" className="form-check-input" type="checkbox" checked={settings.notifications} onChange={(event) => update("notifications", event.target.checked)} /><label className="form-check-label fw-semibold" htmlFor="notifications">Enable study reminders preference</label><div className="form-text">The app stores this preference; email or push delivery is not currently configured.</div></div></div>
              <div className="col-12 mt-4"><button className="btn btn-primary px-4" type="submit" disabled={saving}>{saving ? "Saving preferences..." : "Save preferences"}</button></div>
            </div>}
          </form>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <section className="product-surface p-4">
            <div className="d-flex align-items-center gap-3 mb-3"><span className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 44, height: 44, background: "#235f91" }}>{user.username?.[0]?.toUpperCase() || "S"}</span><div><h2 className="h6 fw-bold mb-1">{user.username || "Your account"}</h2><p className="small text-secondary mb-0">{user.email || ""}</p></div></div>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={() => navigate("/profile")}>Manage profile</button>
          </section>
          <section className="product-surface p-4">
            <h2 className="h6 fw-bold mb-2">Privacy & security</h2><p className="small text-secondary">Your study records are scoped to your account. Passwords are stored as hashes; never share your sign-in details.</p>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={logout}>Sign out</button>
          </section>
          <section className="rounded-4 p-4" style={{ border: "1px solid #f1c7c7", background: "#fffafa" }}>
            <h2 className="h6 fw-bold text-danger mb-2">Delete account</h2><p className="small text-secondary">Permanently remove your account, sessions, subjects, plans, and analysis history.</p>
            <button type="button" className="btn btn-outline-danger" onClick={deleteAccount}>Delete my account</button>
          </section>
        </div>
      </div>
    </main>
  );
}
