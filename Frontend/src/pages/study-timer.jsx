import { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import { api } from "../services/api";

export default function StudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [topic, setTopic] = useState("");
  const [focusScore, setFocusScore] = useState(80);
  const [message, setMessage] = useState("");
  const startedAt = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const toggle = () => {
    if (!running && seconds === 0) startedAt.current = new Date();
    setRunning((value) => !value);
  };

  const reset = () => { setRunning(false); setSeconds(0); setDistractions(0); };

  const saveSession = async () => {
    if (seconds < 1) { setMessage("Run the timer before saving a session."); return; }
    if (!topic.trim()) { setMessage("Enter a topic before saving."); return; }
    try {
      await api.post("/data/sessions", {
        topic: topic.trim(), durationMinutes: Math.max(1, Math.round(seconds / 60)), distractionMinutes: distractions,
        focusScore: Number(focusScore), notes: `Saved from study timer`, date: startedAt.current || new Date(),
      });
      setMessage("Session saved to MongoDB."); reset();
    } catch (error) { setMessage(error.response?.data?.message || "Unable to save session."); }
  };

  const time = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");

  return (
    <div className="container d-flex flex-column gap-4 mt-4" style={{ position: "relative", top: 59, paddingBottom: 40 }}>
      <h2>Study Timer</h2>
      <Card width="1250px" content={<div className="text-center">
        <h1 style={{ fontSize: "4rem" }}>{time}</h1>
        <input className="form-control mx-auto mb-3" style={{ maxWidth: 420 }} placeholder="Study topic (for example: Graphs)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <label className="d-block mb-2">Focus score: {focusScore}%</label>
        <input className="form-range mx-auto mb-3" style={{ maxWidth: 420 }} type="range" min="0" max="100" value={focusScore} onChange={(e) => setFocusScore(e.target.value)} />
        <button className="btn btn-primary me-3" onClick={toggle}>{running ? "Pause" : "Start"}</button>
        <button className="btn btn-warning me-3" onClick={() => setDistractions((value) => value + 1)}>Log Distraction ({distractions})</button>
        <button className="btn btn-outline-dark me-3" onClick={reset}>Reset</button>
        <button className="btn btn-success" onClick={saveSession}>Save Session</button>
        {message && <div className="alert alert-info mt-3 mb-0">{message}</div>}
      </div>} />
    </div>
  );
}