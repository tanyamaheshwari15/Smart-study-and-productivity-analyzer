import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuthToken, setStoredUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const { token, user } = response.data;

      setAuthToken(token);
      setStoredUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center mb-3">Login</h2>

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

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button className="btn btn-primary w-100" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-3">
          <small>
            Need an account? <Link to="/signup">Signup</Link>
          </small>
        </div>
      </div>
    </div>
  );
}