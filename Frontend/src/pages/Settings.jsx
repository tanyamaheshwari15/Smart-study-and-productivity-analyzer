import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api, getStoredUser, clearSession } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard");
        setSettings(response.data.data.settings || {
          theme: "dark",
          notifications: true,
          studyGoalHours: 8,
          preferredTime: "Evening",
        });
      } catch (err) {
        setSettings({
          theme: "dark",
          notifications: true,
          studyGoalHours: 8,
          preferredTime: "Evening",
        });
      }
    };

    load();
  }, []);

  const user = getStoredUser() || { username: "Student" };
  const currentSettings = settings || { theme: "dark", notifications: true, studyGoalHours: 8, preferredTime: "Evening" };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account and all study data permanently?")) return;
    await api.delete("/data/account");
    clearSession();
    navigate("/");
  };

  const saveDisplaySettings = (theme) => {
    localStorage.setItem("smartStudyTheme", theme);
    setSettings((value) => ({ ...value, theme }));
  };

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: "40px" }}>
      <div className="mb-2">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#2c3e50", marginBottom: "0.5rem" }}>Settings & Preferences</h2>
        <p style={{ color: "#7f8c8d", marginBottom: 0 }}>Customize your study experience</p>
      </div>
      <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="540px" height="auto" icon="👤" title="Profile" content={
          <div className="d-flex flex-column gap-2">
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Name</span><br/><strong style={{ color: "#2c3e50" }}>{user.username}</strong></div>
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Account Status</span><br/><strong style={{ color: "#27ae60" }}>Active</strong></div>
          </div>
        } />

        <Card width="540px" height="auto" icon="🎨" title="Display" content={
          <div className="d-flex flex-column gap-3">
            <div>
              <div style={{ color: "#7f8c8d", fontSize: "0.9rem", marginBottom: "4px" }}>Theme</div>
              <select className="form-select form-select-sm" style={{ borderRadius: "6px" }} value={currentSettings.theme} onChange={(e) => saveDisplaySettings(e.target.value)}>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
          </div>
        } />

        <Card width="540px" height="auto" icon="🔔" title="Notifications" content={
          <div className="d-flex align-items-center gap-2">
            <input type="checkbox" id="notif" defaultChecked={currentSettings.notifications} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
            <label htmlFor="notif" style={{ marginBottom: 0, cursor: "pointer", color: "#2c3e50" }}>Enable email notifications</label>
          </div>
        } />

        <Card width="540px" height="auto" icon="⏰" title="Study Preferences" content={
          <div className="d-flex flex-column gap-2">
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Daily Goal (hours)</span><br/><strong style={{ color: "#3498db", fontSize: "1.2rem" }}>{currentSettings.studyGoalHours}</strong></div>
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Preferred Time</span><br/><strong style={{ color: "#2c3e50" }}>{currentSettings.preferredTime}</strong></div>
          </div>
        } />

        <Card width="540px" height="auto" icon="🔐" title="Security" content={
          <div className="d-flex flex-column gap-2">
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Password</span><br/><strong style={{ color: "#27ae60" }}>✓ Securely hashed</strong></div>
          </div>
        } />

        <Card width="540px" height="auto" icon="🔌" title="Integrations" content={<p className="mb-0">No external integrations are configured. Core features use MongoDB and optional Gemini AI.</p>} />

        <Card width="100%" height="auto" icon="⚠️" title="Danger Zone" content={
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div style={{ fontWeight: 600, color: "#e74c3c", marginBottom: "4px" }}>Delete Account</div>
              <div style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>This action cannot be undone</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>Logout</button>
              <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteAccount}>Delete</button>
            </div>
          </div>
        } />
      </div>
    </div>
  );
}
