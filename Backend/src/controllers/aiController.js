import axios from "axios";
import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";
import Subject from "../models/Subject.js";
import StudyActivity from "../models/StudyActivity.js";
import AIAnalysis from "../models/AIAnalysis.js";

const validStringArray = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 8) : [];

const buildContext = async (userId) => {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 30);
  const [sessions, goals, subjects, activities] = await Promise.all([
    StudySession.find({ userId, date: { $gte: periodStart, $lte: periodEnd } }).sort({ date: -1 }),
    StudyGoal.find({ userId }),
    Subject.find({ userId, archived: false }).sort({ priority: -1 }),
    StudyActivity.find({ userId }).sort({ startAt: -1 }).limit(100),
  ]);
  const subjectMap = new Map(subjects.map((subject) => [String(subject._id), subject.name]));
  const bySubject = {};
  sessions.forEach((session) => {
    const name = session.subjectId ? subjectMap.get(String(session.subjectId)) : session.topic;
    if (!name) return;
    bySubject[name] ||= { minutes: 0, sessions: 0, distractionMinutes: 0, focusTotal: 0 };
    bySubject[name].minutes += session.durationMinutes || 0;
    bySubject[name].sessions += 1;
    bySubject[name].distractionMinutes += session.distractionMinutes || 0;
    bySubject[name].focusTotal += session.focusScore || 0;
  });
  const subjectsStats = Object.entries(bySubject).map(([name, value]) => ({
    name,
    minutes: value.minutes,
    sessions: value.sessions,
    averageFocus: value.sessions ? Math.round(value.focusTotal / value.sessions) : 0,
    distractionMinutes: value.distractionMinutes,
  })).sort((a,b) => b.minutes - a.minutes);
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
  const averageFocus = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + (session.focusScore || 0), 0) / sessions.length) : 0;
  const activeDates = new Set(sessions.map((session) => new Date(session.date).toISOString().slice(0,10)));
  const missed = activities.filter((activity) => activity.status === "missed").length;
  const postponed = activities.filter((activity) => activity.status === "postponed").length;
  const completed = activities.filter((activity) => activity.status === "completed").length;
  return {
    periodStart, periodEnd, recordCounts: { sessions: sessions.length, goals: goals.length, subjects: subjects.length, activities: activities.length },
    sessions: sessions.slice(0,50), subjects, subjectsStats, goals,
    statistics: { totalMinutes, averageFocus, activeDays: activeDates.size, missed, postponed, completed },
  };
};

const fallbackAnalysis = (context) => {
  const weakest = context.subjectsStats
    .filter((item) => item.minutes > 0)
    .sort((a,b) => (a.averageFocus - b.averageFocus) || (a.minutes - b.minutes))[0];
  const goalsBehind = context.goals.filter((goal) => goal.status === "active" && goal.completedHours < goal.targetHours);
  const recommendations = [];
  if (weakest) recommendations.push(`Review ${weakest.name}: it has ${weakest.minutes} recorded minutes and ${weakest.averageFocus}% average focus in the 30-day period.`);
  if (context.statistics.missed) recommendations.push(`${context.statistics.missed} planned activities were marked missed; reschedule only the upcoming items rather than changing completed history.`);
  if (goalsBehind.length) recommendations.push(`${goalsBehind.length} study goal(s) remain incomplete; add the remaining effort to upcoming subject sessions.`);
  if (!recommendations.length) recommendations.push("No repeated weakness or missed activity is visible in the current records. Continue recording sessions consistently.");
  return {
    summary: context.recordCounts.sessions
      ? `This 30-day analysis covers ${context.recordCounts.sessions} sessions totaling ${Math.round(context.statistics.totalMinutes / 60 * 10) / 10} hours.`
      : "There are no study sessions in the 30-day analysis period, so this analysis cannot identify a pattern.",
    findings: weakest ? [{ type: "subject_attention", title: `${weakest.name} needs attention`, explanation: `${weakest.minutes} minutes logged with ${weakest.averageFocus}% average focus.`, evidence: ["session-duration", "focus-score"] }] : [{ type: "data_gap", title: "Insufficient recorded data", explanation: "Add sessions with subjects to generate subject-level findings.", evidence: ["session-count"] }],
    recommendations,
    warnings: context.statistics.missed ? [{ type: "consistency", title: "Missed planned sessions", evidence: [`${context.statistics.missed} missed activities`], action: "Reschedule upcoming activities only." }] : [],
    evidence: [{ period: "30-day period", sessionCount: context.recordCounts.sessions, totalMinutes: context.statistics.totalMinutes, averageFocus: context.statistics.averageFocus }],
  };
};

export const analyzeStudyHabits = async (req, res, next) => {
  try {
    const context = await buildContext(req.user.userId);
    const cached = await AIAnalysis.findOne({ userId: req.user.userId, createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } }).sort({ createdAt: -1 });
    if (req.method !== "POST" && cached) return res.json({ message: "Saved analysis returned", data: cached });

    const key = process.env.GEMINI_API_KEY;
    if (process.env.AI_PROVIDER === "gemini" && key) {
      const prompt = `Analyze this user's actual 30-day study data. Return only valid JSON with keys summary (string), findings (array of {type,title,explanation,evidence}), recommendations (string array), warnings (array of {type,title,evidence,action}), evidence (array). Do not claim mastery or certainty beyond the data. Context: ${JSON.stringify({ statistics: context.statistics, subjectsStats: context.subjectsStats, goals: context.goals.map((goal) => ({ title: goal.title, targetHours: goal.targetHours, completedHours: goal.completedHours, status: goal.status })), recordCounts: context.recordCounts })}`;
      try {
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }, { timeout: 15000 });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/i, ""));
          if (typeof parsed.summary === "string" && Array.isArray(parsed.findings)) {
            const saved = await AIAnalysis.create({
              userId: req.user.userId, provider: "gemini", status: "generated",
              dataPeriodStart: context.periodStart, dataPeriodEnd: context.periodEnd,
              recordCounts: context.recordCounts, summary: parsed.summary,
              insights: parsed.findings, recommendations: validStringArray(parsed.recommendations),
              evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [], warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
              rawProviderResponse: parsed,
            });
            return res.json({ message: "Gemini study analysis generated", data: saved });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini analysis unavailable:", geminiError.response?.status || geminiError.code || geminiError.message);
      }
    }

    const fallback = fallbackAnalysis(context);
    const saved = await AIAnalysis.create({
      userId: req.user.userId, provider: "deterministic", status: "fallback",
      dataPeriodStart: context.periodStart, dataPeriodEnd: context.periodEnd,
      recordCounts: context.recordCounts, summary: fallback.summary,
      insights: fallback.findings, recommendations: fallback.recommendations,
      evidence: fallback.evidence, warnings: fallback.warnings,
    });
    return res.json({ message: "Analysis generated from real records without Gemini", data: saved });
  } catch (error) { next(error); }
};

export const listAnalyses = async (req, res, next) => {
  try {
    const analyses = await AIAnalysis.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ data: analyses });
  } catch (error) { next(error); }
};
