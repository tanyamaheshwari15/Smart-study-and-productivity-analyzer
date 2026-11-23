import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getStoredUser, setStoredUser } from "../services/api";
import { formatMinutes } from "../utils/duration";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => setProfile(response.data.data.profile || getStoredUser()))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const updateName = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const username = new FormData(event.currentTarget).get("username");
    try {
      const response = await api.put("/data/profile", { username });
      setProfile((current) => ({ ...current, username: response.data.user.username }));
      setStoredUser({ ...getStoredUser(), ...response.data.user });
      setSaved(true);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update your profile."); }
    finally { setSaving(false); }
  };

  return (
    <main className="container-fluid product-page px-3 px-lg-4 mt-4 pb-5">
      <header className="page-heading"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Your account</div><h1 className="h2 mb-1">Profile</h1><p>Your study record and account details, in one place.</p></header>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {saved && <div className="alert alert-success" role="status">Profile name updated.</div>}
      {loading ? <div className="product-surface p-4 placeholder-glow"><span className="placeholder col-5 rounded" /></div> : profile && <div className="row g-4">
        <div className="col-xl-4">
          <section className="product-surface p-4 p-lg-5 text-center h-100">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 76, height: 76, fontSize: 28, background: "linear-gradient(145deg,#235f91,#3182a5)" }}>{profile.username?.[0]?.toUpperCase() || "S"}</div>
            <h2 className="h4 fw-bold mb-1">{profile.username}</h2><p className="text-secondary mb-4">{profile.email}</p>
            <form onSubmit={updateName} className="text-start">
              <label className="form-label fw-semibold" htmlFor="profile-name">Display name</label>
              <div className="input-group"><input id="profile-name" className="form-control" name="username" defaultValue={profile.username} minLength="3" maxLength="40" required /><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button></div>
            </form>
          </section>
        </div>
        <div className="col-xl-8">
          <section className="product-surface p-4 mb-4">
            <h2 className="h6 fw-bold mb-3">Study snapshot</h2>
            <div className="row g-3">
              {[
                ["Total recorded time", formatMinutes(Math.round((profile.studyHours || 0) * 60)), "bi-hourglass-split"],
                ["Current streak", `${profile.streak || 0} days`, "bi-fire"],
                ["Average focus score", profile.focusScore ? `${profile.focusScore}%` : "Not available", "bi-bullseye"],
                ["Most studied subject", profile.bestTopic || "No sessions yet", "bi-book"],
              ].map(([label, value, icon]) => (
                <div key={label} className="col-sm-6">
                  <div className="rounded-4 p-3 h-100" style={{ background: "#f6f8fb" }}>
                    <div className="small text-secondary mb-2"><i className={`bi ${icon} me-2 text-primary`} />{label}</div>
                    <div className="fw-bold">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="product-surface p-4">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap"><div><h2 className="h6 fw-bold mb-1">Build your study record</h2><p className="small text-secondary mb-0">These metrics describe recorded activity, not academic mastery.</p></div><div className="d-flex gap-2"><Link to="/activity-log" className="btn btn-sm btn-outline-secondary">View sessions</Link><Link to="/ai-insights" className="btn btn-sm btn-outline-primary">Study analysis</Link></div></div>
          </section>
        </div>
      </div>}
    </main>
  );
}
