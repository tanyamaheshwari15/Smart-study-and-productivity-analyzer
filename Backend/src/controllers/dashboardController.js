import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";
import User from "../models/User.js";
import StudyActivity from "../models/StudyActivity.js";
import Subject from "../models/Subject.js";

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
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = date.toDateString();
    const daySessions = sessions.filter((session) => new Date(session.date).toDateString() === dateKey);
    const study = daySessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
    const distraction = daySessions.reduce((sum, session) => sum + (session.distractionMinutes || 0), 0);
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      date: date.toISOString().slice(0, 10),
      study: Math.round((study / 60) * 10) / 10,
      distraction: Math.round((distraction / 60) * 10) / 10,
    };
  });
};

const getActiveDays = (sessions) => new Set(sessions.map((session) => new Date(session.date).toISOString().slice(0, 10))).size;

const getLongestConsecutiveStreak = (sessions) => {
  const days = [...new Set(sessions.map((session) => new Date(session.date).toISOString().slice(0, 10)))].sort();
  let longest = 0;
  let current = 0;
  let previous = null;
  days.forEach((day) => {
    const date = new Date(`${day}T00:00:00Z`);
    if (previous) {
      const expected = new Date(previous);
      expected.setUTCDate(expected.getUTCDate() + 1);
      current = expected.toISOString().slice(0, 10) === day ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    previous = date;
  });
  return longest;
};

const getConsecutiveStreak = (sessions) => {
  const days = new Set(sessions.map((session) => new Date(session.date).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 366; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

const buildDashboardPayload = async (userId) => {
  let sessions = await StudySession.find({ userId }).sort({ date: -1 });
  let goals = await StudyGoal.find({ userId }).sort({ createdAt: -1 });
  const activities = await StudyActivity.find({ userId }).sort({ startAt: -1 });
  const subjects = await Subject.find({ userId, archived: false }).lean();
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

  const todayMinutes = todaySessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
  const todayHours = Number((todayMinutes / 60).toFixed(1));
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyMinutes = sessions
    .filter((session) => new Date(session.date) >= weekAgo)
    .reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayMinutes = sessions
    .filter((session) => new Date(session.date).toDateString() === yesterday.toDateString())
    .reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
  const yesterdayDiff = Number(((todayMinutes - yesterdayMinutes) / 60).toFixed(1));

  const subjectNameById = new Map(subjects.map((subject) => [String(subject._id), subject.name]));
  const subjectMinutes = {};
  sessions.forEach((session) => {
    const name = session.subjectId ? subjectNameById.get(String(session.subjectId)) : session.topic;
    const key = name || "General";
    subjectMinutes[key] = (subjectMinutes[key] || 0) + (session.durationMinutes || 0);
  });
  const subjectDistribution = Object.entries(subjectMinutes)
    .map(([subject, minutes]) => ({ subject, minutes, hours: Number((minutes / 60).toFixed(2) ) }))
    .sort((a, b) => b.minutes - a.minutes);

  const activityLog = sessions.map((session) => ({
    _id: session._id,
    datetime: new Date(session.date).toISOString(),
    type: session.topic || "General",
    durationMinutes: session.durationMinutes || 0,
    duration: Number(((session.durationMinutes || 0) / 60).toFixed(1)),
    focusScore: session.focusScore || 0,
    distractionMinutes: session.distractionMinutes || 0,
    description: session.notes || "Study session",
    notes: `${session.focusScore || 0}% focus • ${session.distractionMinutes || 0} mins distraction`,
  }));

  const userData = {
    id: user?._id || userId,
    username: user?.username || "Student",
    email: user?.email || "student@example.com",
    studyHours: Number((totalMinutes / 60).toFixed(2)),
    studyMinutes: totalMinutes,
    streak: getConsecutiveStreak(sessions),
    longestStreak: getLongestConsecutiveStreak(sessions),
    focusScore: averageFocus,
    bestTopic: sessions.length ? (buildTopicProgress(sessions)[0]?.topic || "No subject") : "No sessions yet",
    goalsCompleted: goals.filter((goal) => goal.status === "completed").length,
  };

  const leaderboard = [{ rank: 1, name: userData.username, score: averageFocus, streak: userData.streak, hours: userData.studyHours }];

  return {
    studyDistractionData: buildStudyDistractionData(sessions),
    subjectDistribution,
    dsaProgress: subjectDistribution.map((item) => ({ topic: item.subject, hours: item.hours })),
    activeSession: {
      isRunning: false,
      time: "00:00:00",
    },
    activityHeatmap: Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - index));
      const minutes = sessions
        .filter((session) => new Date(session.date).toDateString() === day.toDateString())
        .reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
      return { date: day.toISOString().slice(0, 10), minutes, value: Math.min(5, Math.round(minutes / 60)) };
    }),
    weeks: [Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - index));
      const minutes = sessions
        .filter((session) => new Date(session.date).toDateString() === day.toDateString())
        .reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
      return { date: day.toISOString().slice(0, 10), minutes, value: Math.min(5, Math.round(minutes / 60)) };
    })],
    stats: {
      totalMinutes,
      todayMinutes,
      weeklyMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      todayHours,
      weeklyHours: Number((weeklyMinutes / 60).toFixed(1)),
      yesterdayDiff,
      focusScore: averageFocus,
      totalSessions: sessions.length,
      currentStreak: getConsecutiveStreak(sessions),
      longestStreak: getLongestConsecutiveStreak(sessions),
      plannedMinutes: activities.reduce((sum, item) => sum + (item.status === "planned" ? item.durationMinutes : 0), 0),
      completedPlannedMinutes: activities.reduce((sum, item) => sum + (item.status === "completed" ? item.durationMinutes : 0), 0),
      missedSessions: activities.filter((item) => item.status === "missed").length,
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
      theme: user?.preferences?.theme || "light",
      notifications: user?.preferences?.notifications ?? true,
      studyGoalHours: goals[0]?.targetHours || Number(((user?.preferences?.dailyGoalMinutes || 120) / 60).toFixed(1)),
      preferredTime: user?.preferences?.preferredTime || "Evening",
      availableHours: user?.preferences?.availableHours || 2,
      breakMinutes: user?.preferences?.breakMinutes || 10,
    },
    insights: {
      streak: getConsecutiveStreak(sessions),
      longestStreak: getLongestConsecutiveStreak(sessions),
      bestTime: "Not enough evidence yet",
      tip: sessions.length ? (buildTopicProgress(sessions)[0]?.topic || "No subject") : "Record a study session",
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
