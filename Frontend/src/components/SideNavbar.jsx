import { NavLink } from "react-router-dom";

export default function SideNavbar() {
  return (
    <div
      className="app-sidebar position-fixed bg-dark vh-100"
      style={{ width: "220px", top: "60px" }}
    >
      <div className="app-sidebar-inner p-3">
        <div className="nav nav-pills flex-column gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-columns-gap me-2"></i>
            Dashboard
          </NavLink>

          <NavLink
            to="/study-timer"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-clock me-2"></i>
            Study Timer
          </NavLink>

          <NavLink
            to="/subjects"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-book me-2"></i>
            Subjects
          </NavLink>

          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-calendar3 me-2"></i>
            AI Planner
          </NavLink>

          <NavLink
            to="/activity-log"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-journal-text me-2"></i>
            Activity Log
          </NavLink>

          <NavLink
            to="/ai-insights"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-lightbulb me-2"></i>
            AI Insights
          </NavLink>

          <NavLink
            to="/goal"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-bullseye me-2"></i>
            Goals
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-gear me-2"></i>
            Settings
          </NavLink>
        </div>
      </div>
    </div>
  );
}