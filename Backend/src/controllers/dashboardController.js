import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";
import User from "../models/User.js";

const buildTopicProgress = (sessions) => {
  const grouped = {};

  sessions.forEach((session) => {
    const topic = session.topic || "General";
    if (!grouped[topic]) {
      grouped[topic] = { totalFocus: 0, count: 0 };
    }
    grouped[topic].totalFocus += session.focusScore || 0;
    grouped[topic].count += 1;
  });

  return Object.entries(grouped)
    .map(([topic, value]) => ({
      topic,
      progress: Math.min(100, Math.round(value.totalFocus / value.count)),
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);
};

const buildStudyDistractionData = (sessions) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map = {};

  sessions.forEach((session) => {
    const date = new Date(session.date);
    const day = dayNames[date.getDay()];
    if (!map[day]) {
      map[day] = { study: 0, distraction: 0, count: 0 };
    }
    map[day].study += session.durationMinutes || 0;
    map[day].distraction += session.distractionMinutes || 0;
    map[day].count += 1;
  });

  return dayNames.map((day) => ({
    day,
    study: Math.round(((map[day]?.study || 0) / 60) * 10) / 10,
    distraction: Math.round(((map[day]?.distraction || 0) / 60) * 10) / 10,
  }));
};

const getActiveDays = (sessions) => new Set(sessions.map((session) => new Date(session.date).toISOString().slice(0, 10))).size;

const buildDashboardPayload = async (userId) => {
  let sessions = await StudySession.find({ userId }).sort({ date: -1 }).limit(30);
  let goals = await StudyGoal.find({ userId }).sort({ createdAt: -1 }).limit(10);
  const user = await User.findById(userId).lean();

  // New accounts start with empty real data; no demo data is inserted.

  const totalMinutes = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
  const totalFocus = sessions.reduce((sum, session) => sum + (session.focusScore || 0), 0);
  const averageFocus = sessions.length ? Math.round(totalFocus / sessions.length) : 0;

  const today = new Date();
  const todaySessions = sessions.filter((session) => {
    const d = new Date(session.date);
    return d.toDateString() === today.toDateString();
  });

  const todayHours = Number((todaySessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0) / 60).toFixed(1));

  const activityLog = sessions.map((session) => ({
    _id: session._id,
    datetime: new Date(session.date).toISOString(),
    type: session.topic || "General",
    duration: Number(((session.durationMinutes || 0) / 60).toFixed(1)),
    description: session.notes || "Study session",
    notes: `${session.focusScore || 0}% focus • ${session.distractionMinutes || 0} mins distraction`,
  }));

  const userData = {
    id: user?._id || userId,
    username: user?.username || "Student",
    email: user?.email || "student@example.com",
    studyHours: user?.studyHours ?? Number((totalMinutes / 60).toFixed(1)),
    streak: getActiveDays(sessions),
    focusScore: averageFocus,
    bestTopic: buildTopicProgress(sessions)[0]?.topic || "Arrays",
    goalsCompleted: goals.filter((goal) => goal.status === "completed").length,
  };

  const leaderboard = [{ rank: 1, name: userData.username, score: averageFocus, streak: userData.streak, hours: userData.studyHours }];

  return {
    studyDistractionData: buildStudyDistractionData(sessions),
    dsaProgress: buildTopicProgress(sessions),
    activeSession: {
      isRunning: false,
      time: "00:00:00",
    },
    activityHeatmap: Array.from({ length: 7 }, (_, index) => ({
      date: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10),
      value: sessionValueForDate(index, sessions),
    })),
    weeks: [Array.from({ length: 7 }, (_, index) => ({
      date: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10),
      value: sessionValueForDate(index, sessions),
    }))],
    stats: {
      todayHours,
      yesterdayDiff: 1.2,
      focusScore: averageFocus,
      totalSessions: sessions.length,
    },
    goals: goals.map((goal) => ({
      id: goal._id,
      title: goal.title,
      status: goal.status,
      targetHours: goal.targetHours,
      completedHours: goal.completedHours,
    })),
    activityLog,
    profile: userData,
    leaderboard,
    settings: {
      theme: "dark",
      notifications: true,
      studyGoalHours: goals[0]?.targetHours || 8,
      preferredTime: "Evening",
    },
    insights: {
      streak: getActiveDays(sessions),
      bestTime: averageFocus >= 80 ? "8:00 PM" : "6:00 PM",
      tip: buildTopicProgress(sessions)[0]?.topic || "Arrays",
      summary: `You have completed ${sessions.length} study sessions with an average focus score of ${averageFocus}%.`,
    },
  };
};

const sessionValueForDate = (indexFromToday, sessions) => {
  const targetDate = new Date(Date.now() - (6 - indexFromToday) * 86400000);
  const totalMinutes = sessions
    .filter((session) => new Date(session.date).toDateString() === targetDate.toDateString())
    .reduce((sum, session) => sum + (session.durationMinutes || 0), 0);

  return Math.min(5, Math.max(0, Math.round(totalMinutes / 60)));
};

// Controller for GET /api/dashboard
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const data = await buildDashboardPayload(userId);

    res.json({
      message: "Dashboard data retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
