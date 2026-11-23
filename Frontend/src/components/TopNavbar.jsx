import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { clearSession, getStoredUser } from "../services/api";

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const user = getStoredUser();

  const isAuthPage =
    location.pathname === "/" || location.pathname === "/signup";

  const username = user?.username || "User";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-product fixed-top">
      <div className="container">
        <Link to={isAuthPage ? "/" : "/dashboard"} className="navbar-brand d-flex align-items-center gap-2 text-decoration-none text-dark">
          <span className="rounded-3 d-inline-flex align-items-center justify-content-center text-white" style={{ width: 34, height: 34, background: "#235f91" }}><i className="bi bi-journal-check" /></span>
          <span>Smart Study <span className="text-secondary fw-normal">& Productivity</span></span>
        </Link>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          {location.pathname === "/" && (
            <Link to="/signup" className="btn btn-outline-light me-2">
              Signup
            </Link>
          )}
          {location.pathname === "/signup" && (
            <Link to="/" className="btn btn-outline-light me-2">
              Login
            </Link>
          )}

          {!isAuthPage && (
            <button
              type="button"
              className="d-flex align-items-center gap-2 text-dark"
              style={{ cursor: "pointer", border: 0, background: "transparent" }}
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Open account menu"
            >
              <div
                className="rounded-circle d-flex justify-content-center align-items-center text-white"
                style={{ width: "35px", height: "35px", background: "#235f91" }}
              >
                {username[0]?.toUpperCase() || "U"}
              </div>

              <span>{username}</span>
              <span><i className="bi bi-chevron-down"></i></span>
            </button>
          )}

          <div
            className={`dropdown-menu dropdown-menu-end show mt-2 ${open && !isAuthPage ? "" : "d-none"}`}
          >
            <Link to="/profile" className="dropdown-item"><i className="bi bi-person"></i>&nbsp;
              Profile
            </Link>
            <Link to="/leaderboard" className="dropdown-item"><i className="bi bi-trophy"></i>&nbsp;
              Leaderboard
            </Link>

            <button
              className="dropdown-item text-danger"
              onClick={handleLogout}
            ><i className="bi bi-box-arrow-right"></i>&nbsp;
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}