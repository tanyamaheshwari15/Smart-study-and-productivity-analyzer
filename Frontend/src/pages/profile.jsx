import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api, getStoredUser } from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard");
        setProfile(response.data.data.profile || getStoredUser());
      } catch (err) {
        setProfile(getStoredUser());
      }
    };

    load();
  }, []);

  const user = profile || getStoredUser() || { username: "Student", email: "student@example.com", studyHours: 0, streak: 0, focusScore: 0, bestTopic: "General" };

  const updateName = async (event) => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("username");
    const response = await api.put("/data/profile", { username: name });
    setProfile((value) => ({ ...value, username: response.data.user.username }));
  };

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: "40px" }}>
      <div className="mb-2">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#2c3e50", marginBottom: "0.5rem" }}>Your Profile</h2>
        <p style={{ color: "#7f8c8d", marginBottom: 0 }}>View your academic performance and achievements</p>
      </div>
      <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="580px" height="auto" icon="👤" title="Personal Information" content={
          <div className="d-flex flex-column gap-2">
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Name</span><br/><strong style={{ color: "#2c3e50" }}>{user.username}</strong></div>
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Email</span><br/><strong style={{ color: "#2c3e50" }}>{user.email}</strong></div>
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Status</span><br/><strong style={{ color: "#27ae60" }}>Active Learner</strong></div>
            <form className="d-flex gap-2 mt-2" onSubmit={updateName}><input className="form-control form-control-sm" name="username" defaultValue={user.username} required /><button className="btn btn-sm btn-primary" type="submit">Save</button></form>
          </div>
        } />

        <Card width="580px" height="auto" icon="🎯" title="Study Metrics" content={
          <div className="d-flex flex-column gap-3">
            <div>
              <div style={{ color: "#7f8c8d", fontSize: "0.9rem", marginBottom: "4px" }}>Total Study Hours</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#3498db" }}>{user.studyHours} <span style={{ fontSize: "0.6rem" }}>hrs</span></div>
            </div>
            <div>
              <div style={{ color: "#7f8c8d", fontSize: "0.9rem", marginBottom: "4px" }}>Current Streak</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e74c3c" }}>{user.streak} <span style={{ fontSize: "0.6rem" }}>days 🔥</span></div>
            </div>
          </div>
        } />

        <Card width="580px" height="auto" icon="💪" title="Academic Strengths" content={
          <div className="d-flex flex-column gap-2">
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Focus Score</span><br/><strong style={{ fontSize: "1.3rem", color: user.focusScore >= 80 ? "#27ae60" : "#f39c12" }}>{user.focusScore}%</strong></div>
            <div><span style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>Best Topic</span><br/><strong style={{ color: "#2c3e50" }}>{user.bestTopic}</strong></div>
          </div>
        } />

        <Card width="100%" height="auto" icon="🏆" title="Core Accomplishments" content={
          <div className="d-flex flex-column gap-2">
            <div style={{ paddingLeft: "8px", borderLeft: "3px solid #3498db" }}>
              <span style={{ color: "#2c3e50", fontWeight: 500 }}>{user.studyHours} total study hours</span> logged in your learning journey
            </div>
            <div style={{ paddingLeft: "8px", borderLeft: "3px solid #e74c3c" }}>
              <span style={{ color: "#2c3e50", fontWeight: 500 }}>{user.streak} day streak</span> of consistent learning
            </div>
            <div style={{ paddingLeft: "8px", borderLeft: "3px solid #27ae60" }}>
              <span style={{ color: "#2c3e50", fontWeight: 500 }}>{user.focusScore}% focus score</span> average across all sessions
            </div>
            <div style={{ paddingLeft: "8px", borderLeft: "3px solid #9b59b6" }}>
              Mastering <span style={{ color: "#2c3e50", fontWeight: 500 }}>{user.bestTopic}</span> with deep expertise
            </div>
          </div>
        } />
      </div>
    </div>
  );
}
