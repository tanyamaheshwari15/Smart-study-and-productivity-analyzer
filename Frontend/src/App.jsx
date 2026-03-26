import { Routes, Route, useLocation } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";
import TopNavbar from "./components/TopNavbar";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import StudyTimer from "./components/study-timer";

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
        </Routes>
      </div>
    </>
  )
}

export default App
