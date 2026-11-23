import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuthToken, setStoredUser } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      const { token, user } = response.data;
      setAuthToken(token);
      setStoredUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center mb-3">Signup</h2>

        <input
          className="form-control mb-2"
          name="username"
          placeholder="Name"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button className="btn btn-primary w-100" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="text-center mt-3">
          <small>
            Already have an account? <Link to="/">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
}