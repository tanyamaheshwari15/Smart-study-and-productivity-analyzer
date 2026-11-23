import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuthToken, setStoredUser } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Use a password with at least 6 characters."); return; }
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { username: form.username, email: form.email, password: form.password });
      setAuthToken(response.data.token);
      setStoredUser(response.data.user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="small text-uppercase fw-semibold mb-3" style={{ letterSpacing: ".15em", color: "#b9d1e8" }}>Build a routine that works for you</div>
        <h1 className="display-5 fw-bold mb-3">Progress starts with paying attention.</h1>
        <p className="fs-5 mb-4" style={{ maxWidth: 560, color: "#d8e6f2" }}>Create a private workspace for your subjects, study sessions, goals, and weekly plans.</p>
        <div className="rounded-4 p-4 mt-2" style={{ maxWidth: 520, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)" }}>
          <i className="bi bi-quote fs-3" />
          <p className="mb-0 mt-2">Small, consistent sessions become visible progress when you keep a thoughtful record.</p>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form">
          <div className="mb-4"><div className="small text-uppercase fw-semibold text-primary mb-2" style={{ letterSpacing: ".1em" }}>Get started</div><h2 className="h3 fw-bold mb-2">Create your account</h2><p className="text-secondary mb-0">Your study records stay associated with your account.</p></div>
          <form onSubmit={handleSignup} className="d-flex flex-column gap-3">
            <div><label className="form-label fw-semibold" htmlFor="signup-name">Name</label><input id="signup-name" className="form-control" name="username" autoComplete="name" minLength="3" maxLength="40" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></div>
            <div><label className="form-label fw-semibold" htmlFor="signup-email">Email address</label><input id="signup-email" className="form-control" name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
            <div><label className="form-label fw-semibold" htmlFor="signup-password">Password</label><input id="signup-password" className="form-control" name="password" type="password" autoComplete="new-password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><div className="form-text">At least 6 characters.</div></div>
            <div><label className="form-label fw-semibold" htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" className="form-control" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required /></div>
            {error && <div className="alert alert-danger py-2 mb-0" role="alert">{error}</div>}
            <button className="btn btn-primary w-100 py-2 mt-1" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"} {!loading && <i className="bi bi-arrow-right ms-2" />}</button>
          </form>
          <p className="text-center text-secondary mt-4 mb-0">Already have an account? <Link to="/" className="fw-semibold text-decoration-none">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
