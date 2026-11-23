import axios from "axios";
import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";

const fallback = (payload) => {
  const weakest = payload.topics.sort((a,b) => a.progress - b.progress)[0]?.topic || "your weakest topic";
  const bestTime = payload.focusScore >= 75 ? "8:00 PM - 10:00 PM" : "6:00 PM - 8:00 PM";
  const plan = [
    { day: "Today", topic: weakest, durationMinutes: 50, reason: "Highest-priority weak area based on logged focus" },
    { day: "Tomorrow", topic: payload.topics[0]?.topic || "General review", durationMinutes: 45, reason: "Consolidate recent study material" },
    { day: "This week", topic: weakest, durationMinutes: 120, reason: "Focused review to improve topic mastery" },
  ];
  return { summary: `You logged ${payload.studyHours} study hours with ${payload.focusScore}% average focus.`, strengths: ["Habit tracking is active", "Recent sessions provide measurable performance"], recommendations: [`Prioritize ${weakest}`, "Use 25/5 minute focus blocks", "Review distraction patterns after each session"], bestTime, focusScore: payload.focusScore, nextAction: `Start a 50-minute ${weakest} session`, plan, provider: "data-rule-fallback" };
};

const buildPayload = async (userId) => {
  const [sessions, goals] = await Promise.all([
    StudySession.find({ userId }).sort({ date: -1 }).limit(30),
    StudyGoal.find({ userId }).sort({ createdAt: -1 }).limit(10),
  ]);
  const topicMap = {};
  sessions.forEach((s) => {
    const topic = s.topic || "General";
    topicMap[topic] ||= { topic, progressTotal: 0, count: 0, minutes: 0 };
    topicMap[topic].progressTotal += s.focusScore || 0;
    topicMap[topic].count += 1;
    topicMap[topic].minutes += s.durationMinutes || 0;
  });
  const topics = Object.values(topicMap).map((t) => ({ topic: t.topic, progress: Math.round(t.progressTotal / t.count), minutes: t.minutes })).sort((a,b) => a.progress - b.progress);
  const studyMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const focusScore = sessions.length ? Math.round(sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessions.length) : 0;
  const distractionMinutes = sessions.reduce((sum, s) => sum + (s.distractionMinutes || 0), 0);
  const uniqueDates = new Set(sessions.filter(s => s.date).map(s => new Date(s.date).toISOString().slice(0,10)));
  return { studyHours: Number((studyMinutes / 60).toFixed(1)), streak: uniqueDates.size, focusScore, topics, distractions: distractionMinutes, recentSessions: sessions.slice(0,5), goals: goals.map(g => ({ title:g.title, status:g.status, targetHours:g.targetHours, completedHours:g.completedHours })) };
};

export const getAIInsights = async (req, res, next) => {
  try {
    const payload = await buildPayload(req.user.userId);
    const key = process.env.GEMINI_API_KEY;
    if (process.env.AI_PROVIDER === "gemini" && key) {
      const prompt = `Act as a study productivity coach. Use only this real MongoDB-derived student data: ${JSON.stringify(payload)}. Return strictly valid JSON with keys summary, strengths(array), recommendations(array), bestTime, focusScore(number), nextAction, plan(array of objects with day, topic, durationMinutes, reason). Be concise and actionable.`;
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }, { timeout: 20000 });
      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/i, ""));
        parsed.provider = "gemini";
        return res.json({ message: "Gemini AI insights generated successfully", data: parsed });
      }
    }
    return res.json({ message: "Insights generated from real study data", data: fallback(payload) });
  } catch (error) {
    // Gemini outages should never break the dashboard; use the real-data adaptive fallback.
    try {
      const payload = await buildPayload(req.user.userId);
      return res.json({
        message: "Insights generated from real study data; Gemini temporarily unavailable",
        data: fallback(payload),
      });
    } catch (fallbackError) {
      next(fallbackError);
    }
  }
};
