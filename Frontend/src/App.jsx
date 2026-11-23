import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";
import TopNavbar from "./components/TopNavbar";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import StudyTimer from "./pages/study-timer";
import ActivityLog from "./pages/activity-log";
import Insights from "./pages/insights";
import Goals from "./pages/Goal";
import Settings from "./pages/Settings";
import Profile from "./pages/profile";
import Leaderboard from "./pages/Leaderboard";

const isAuthenticated = () => Boolean(localStorage.getItem("smartStudyToken"));

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/" replace />;

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/signup";

  return (
    <>
      <TopNavbar />
      {!hideNavbar && <SideNavbar />}
      <div style={{ marginLeft: hideNavbar ? "0" : "200px" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/study-timer" element={<ProtectedRoute><StudyTimer /></ProtectedRoute>} />
          <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/ai-insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/goal" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  )
}

export default App
