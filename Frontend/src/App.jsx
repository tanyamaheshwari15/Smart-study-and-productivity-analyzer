import { Routes, Route, useLocation } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";
import TopNavbar from "./components/TopNavbar";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import StudyTimer from "./pages/study-timer";
import ActivityLog from "./pages/activity-log";
import Insights from "./pages/insights";
import Goals from "./pages/Goal";

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
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/study-timer" element={<StudyTimer/>} />
          <Route path="/activity-log" element={<ActivityLog/>} />
          <Route path="/ai-insights" element={<Insights/>} />
          <Route path="/goal" element={<Goals/>} />
        </Routes>
      </div>
    </>
  )
}

export default App
