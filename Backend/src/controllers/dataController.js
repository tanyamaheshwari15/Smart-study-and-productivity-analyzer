import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";
import User from "../models/User.js";

export const createSession = async (req, res, next) => {
  try {
    const { topic, durationMinutes, distractionMinutes, focusScore, notes, date } = req.body;
    const session = await StudySession.create({
      userId: req.user.userId,
      topic: topic || "General study",
      durationMinutes: Math.max(0, Number(durationMinutes) || 0),
      distractionMinutes: Math.max(0, Number(distractionMinutes) || 0),
      focusScore: Math.min(100, Math.max(0, Number(focusScore) || 0)),
      notes,
      date: date ? new Date(date) : new Date(),
      isCompleted: true,
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { studyHours: (session.durationMinutes || 0) / 60 },
    });

    res.status(201).json({ message: "Study session saved", data: session });
  } catch (error) { next(error); }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ message: "Study session not found" });
    res.json({ message: "Study session deleted" });
  } catch (error) { next(error); }
};

export const createGoal = async (req, res, next) => {
  try {
    const { title, description, targetHours, completedHours, status, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Goal title is required" });
    const goal = await StudyGoal.create({
      userId: req.user.userId,
      title: title.trim(),
      description,
      targetHours: Math.max(0, Number(targetHours) || 0),
      completedHours: Math.max(0, Number(completedHours) || 0),
      status: ["active", "completed", "paused"].includes(status) ? status : "active",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ message: "Study goal created", data: goal });
  } catch (error) { next(error); }
};

export const updateGoal = async (req, res, next) => {
  try {
    const allowed = ["title", "description", "targetHours", "completedHours", "status", "dueDate"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const goal = await StudyGoal.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, updates, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ message: "Study goal not found" });
    res.json({ message: "Study goal updated", data: goal });
  } catch (error) { next(error); }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await StudyGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: "Study goal not found" });
    res.json({ message: "Study goal deleted" });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { ...(req.body.username ? { username: req.body.username } : {}) } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) { next(error); }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await Promise.all([
      StudySession.deleteMany({ userId: req.user.userId }),
      StudyGoal.deleteMany({ userId: req.user.userId }),
      User.findByIdAndDelete(req.user.userId),
    ]);
    res.json({ message: "Account and associated data deleted" });
  } catch (error) { next(error); }
};
