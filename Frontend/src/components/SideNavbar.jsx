import { Link } from "react-router-dom";
export default function SideNavbar() {
    return (
        <div className="d-flex flex-column bg-dark vh-100" style={{
      width: "207px",
      position: "fixed",
      left: 0,
      top: 59,
      color: "white",
    }}>
            <div className="p-3 d-flex flex-column gap-3 mt-3">
            <Link to="/dashboard" className="nav-link"><i className="bi bi-columns-gap"></i>&nbsp;
            Dashboard
            </Link>
            <Link to="/study-timer" className="nav-link"><i className="bi bi-clock"></i>&nbsp;
            Study Timer
            </Link>
            <Link to="/activity-log" className="nav-link"><i className="bi bi-journal-text"></i>&nbsp;
            Activity Log
            </Link>
            <Link to="/ai-insights" className="nav-link"><i className="bi bi-lightbulb"></i>&nbsp;
            AI Insights
            </Link>
            <Link to="/goal" className="nav-link"><i className="bi bi-bullseye"></i>&nbsp;
            Goals
            </Link>
            <Link to="/settings" className="nav-link"><i className="bi bi-gear"></i>&nbsp;
            Settings</Link>
            </div>
        </div>
    )
}