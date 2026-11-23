import { useEffect, useState } from "react";
import Card from "../components/Card";
import { api, getStoredUser } from "../services/api";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard");
        setLeaderboard(response.data.data.leaderboard || []);
      } catch (err) {
        setLeaderboard([]);
      }
    };

    load();
  }, []);

  const getRankMedal = (rank) => rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "📊";

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: "40px" }}>
      <div className="mb-2">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#2c3e50", marginBottom: "0.5rem" }}>Leaderboard</h2>
        <p style={{ color: "#7f8c8d", marginBottom: 0 }}>See how you stack up against the community</p>
      </div>
      <div className="d-flex gap-4 flex-wrap justify-content-center">
        <Card width="100%" height="auto" icon="🏅" title="Monthly Rankings" content={
          <div className="d-flex flex-column gap-2">
            {leaderboard.map((item) => (
              <div key={item.rank} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                padding: "12px", 
                background: item.rank === 1 ? "#fffacd" : "#f8f9fa",
                borderRadius: "8px",
                borderLeft: `4px solid ${["#ffd700", "#c0c0c0", "#cd7f32", "#95a5a6"][item.rank - 1]}`
              }}>
                <span style={{ fontSize: "1.4rem" }}>{getRankMedal(item.rank)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#2c3e50" }}>#{item.rank} {item.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>Score: {item.score} | Streak: {item.streak}d | Hours: {item.hours}h</div>
                </div>
              </div>
            ))}
          </div>
        } />

        <Card width="48%" height="auto" icon="🎖️" title="Your Metrics" content={
          <div className="d-flex flex-column gap-2">
            {leaderboard.length ? [
              `🔥 ${leaderboard[0].streak} active study days`,
              `📚 ${leaderboard[0].hours} study hours`,
              `🎯 ${leaderboard[0].score}% average focus`,
            ].map((badge, idx) => (
              <div key={idx} style={{ padding: "8px 12px", background: "#e3f2fd", borderRadius: "6px", fontWeight: 500, color: "#1976d2" }}>{badge}</div>
            )) : <p className="mb-0">Log study sessions to unlock personal metrics.</p>}
          </div>
        } />

        <Card width="48%" height="auto" icon="📈" title="Account Summary" content={
          <div className="d-flex flex-column gap-2">
            {leaderboard[0] ? <>
              <div><span style={{ color: "#7f8c8d" }}>Rank</span><br/><strong style={{ fontSize: "1.3rem", color: "#2c3e50" }}>#{leaderboard[0].rank}</strong></div>
              <div><span style={{ color: "#7f8c8d" }}>Focus Score</span><br/><strong style={{ fontSize: "1.3rem", color: "#3498db" }}>{leaderboard[0].score}%</strong></div>
            </> : <p className="mb-0">No account ranking data yet.</p>}
          </div>
        } />
      </div>
    </div>
  );
}
