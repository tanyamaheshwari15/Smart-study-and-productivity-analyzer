import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken, setStoredUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", form);
      setAuthToken(response.data.token);
      setStoredUser(response.data.user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Check your connection and try again.");
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="small text-uppercase fw-semibold mb-3" style={{ letterSpacing: ".15em", color: "#b9d1e8" }}>A calmer way to make progress</div>
        <h1 className="display-5 fw-bold mb-3">Make your study time count.</h1>
        <p className="fs-5 mb-4" style={{ maxWidth: 560, color: "#d8e6f2" }}>Track focused sessions, understand your habits, and make a plan that fits your week.</p>
        <div className="d-flex flex-column gap-3">
          {[["bi-clock-history", "A real record of your study sessions"], ["bi-bar-chart-line", "Progress based on your own activity"], ["bi-stars", "Optional AI analysis and study planning"]].map(([icon, text]) => <div key={text} className="d-flex align-items-center gap-3"><span className="rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: "rgba(255,255,255,.12)" }}><i className={`bi ${icon}`} /></span><span>{text}</span></div>)}
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form">
          <div className="mb-4"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Your workspace</div><h2 className="h3 fw-bold mb-2">Welcome back</h2><p className="text-secondary mb-0">Sign in to continue your study journey.</p></div>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div><label className="form-label fw-semibold" htmlFor="login-email">Email address</label><input id="login-email" className="form-control" name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
            <div><label className="form-label fw-semibold" htmlFor="login-password">Password</label><input id="login-password" className="form-control" name="password" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></div>
            {error && <div className="alert alert-danger py-2 mb-0" role="alert">{error}</div>}
            <button className="btn btn-primary w-100 py-2 mt-1" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"} {!loading && <i className="bi bi-arrow-right ms-2" />}</button>
          </form>
          <p className="text-center text-secondary mt-4 mb-0">New here? <Link to="/signup" className="fw-semibold text-decoration-none">Create your account</Link></p>
          <p className="small text-center text-secondary mt-4"><i className="bi bi-lock me-1" />Your account and study data are private to you.</p>
        </div>
      </section>
    </main>
  );
}
