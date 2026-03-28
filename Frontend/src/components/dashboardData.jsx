const studyDistractionData = [
    { day: "Sun", study: 60, distraction: 10 },
    { day: "Mon", study: 25, distraction: 20 },
    { day: "Tue", study: 45, distraction: 20 },
    { day: "Wed", study: 20, distraction: 15 },
    { day: "Thu", study: 18, distraction: 35 },
    { day: "Fri", study: 25, distraction: 20 },
    { day: "Sat", study: 40, distraction: 15 }
];
const dsaProgress = [
  { topic: "Arrays", progress: 70 },
  { topic: "Strings", progress: 50 },
  { topic: "Graphs", progress: 30 },
  { topic: "Pointer", progress: 50 }
];
const activeSession = {
  isRunning: true,
  time: "00:45:12"
};
const activityHeatmap = [
  { day: "Mon", value: 2 },
  { day: "Tue", value: 4 },
  { day: "Wed", value: 3 },
  { day: "Thu", value: 5 },
  { day: "Fri", value: 1 },
  { day: "Sat", value: 4 }
];

const stats = {
  todayHours: 4.5,
  yesterdayDiff: 1.2
};
const insights = {
  streak: 5,
  bestTime: "8:00 PM",
  tip: "Try to tackle weak topics on Mondays."
};
const dashboardData = {
  studyDistractionData,
  dsaProgress,
  activeSession,
  activityHeatmap,
  stats,
  insights
};
export default dashboardData;