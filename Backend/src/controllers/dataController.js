import StudySession from "../models/StudySession.js";
import StudyGoal from "../models/StudyGoal.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import StudyActivity from "../models/StudyActivity.js";
import AIAnalysis from "../models/AIAnalysis.js";
import { z } from "zod";

export const createSession = async (req, res, next) => {
  try {
    const schema = z.object({
      topic: z.string().trim().min(1).max(80).optional(),
      subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
      durationMinutes: z.coerce.number().int().min(1).max(720),
      distractionMinutes: z.coerce.number().int().min(0).max(720).optional(),
      focusScore: z.coerce.number().int().min(0).max(100).optional(),
      notes: z.string().trim().max(2000).optional(),
      date: z.coerce.date().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid study session", errors: parsed.error.flatten() });
    const data = parsed.data;
    let subjectName = data.topic || "General study";
    if (data.subjectId) {
      const subject = await Subject.findOne({ _id: data.subjectId, userId: req.user.userId });
      if (!subject) return res.status(400).json({ message: "Selected subject does not belong to this account" });
      subjectName = subject.name;
    }
    const session = await StudySession.create({
      userId: req.user.userId,
      topic: subjectName,
      subjectId: data.subjectId,
      durationMinutes: data.durationMinutes,
      distractionMinutes: data.distractionMinutes || 0,
      focusScore: data.focusScore ?? 0,
      notes: data.notes || "",
      date: data.date || new Date(),
      isCompleted: true,
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { studyHours: (session.durationMinutes || 0) / 60 },
    });
    if (session.subjectId) {
      await StudyGoal.updateMany(
        { userId: req.user.userId, subjectId: session.subjectId, status: { $ne: "completed" } },
        { $inc: { completedHours: (session.durationMinutes || 0) / 60 } }
      );
    }

    res.status(201).json({ message: "Study session saved", data: session });
  } catch (error) { next(error); }
};

export const updateSession = async (req, res, next) => {
  try {
    const schema = z.object({
      topic: z.string().trim().min(1).max(80).optional(),
      subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
      durationMinutes: z.coerce.number().int().min(1).max(720).optional(),
      distractionMinutes: z.coerce.number().int().min(0).max(720).optional(),
      focusScore: z.coerce.number().int().min(0).max(100).optional(),
      notes: z.string().trim().max(2000).optional(),
      date: z.coerce.date().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid study session", errors: parsed.error.flatten() });
    const existing = await StudySession.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!existing) return res.status(404).json({ message: "Study session not found" });
    if (parsed.data.subjectId) {
      const subject = await Subject.findOne({ _id: parsed.data.subjectId, userId: req.user.userId });
      if (!subject) return res.status(400).json({ message: "Selected subject does not belong to this account" });
      parsed.data.topic = subject.name;
    }
    const updated = await StudySession.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, parsed.data, { new: true, runValidators: true });
    if (existing.subjectId) await StudyGoal.updateMany({ userId: req.user.userId, subjectId: existing.subjectId }, { $inc: { completedHours: -(existing.durationMinutes || 0) / 60 } });
    if (updated.subjectId) await StudyGoal.updateMany({ userId: req.user.userId, subjectId: updated.subjectId }, { $inc: { completedHours: (updated.durationMinutes || 0) / 60 } });
    const sessions = await StudySession.find({ userId: req.user.userId });
    await User.findByIdAndUpdate(req.user.userId, { $set: { studyHours: sessions.reduce((sum, item) => sum + item.durationMinutes, 0) / 60 } });
    res.json({ message: "Study session updated", data: updated });
  } catch (error) { next(error); }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ message: "Study session not found" });
    await User.findByIdAndUpdate(req.user.userId, { $inc: { studyHours: -(session.durationMinutes || 0) / 60 } });
    if (session.subjectId) {
      await StudyGoal.updateMany({ userId: req.user.userId, subjectId: session.subjectId }, {
        $inc: { completedHours: -(session.durationMinutes || 0) / 60 },
      });
    }
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

export const updatePreferences = async (req, res, next) => {
  try {
    const schema = z.object({
      theme: z.enum(["light", "dark"]).optional(),
      notifications: z.boolean().optional(),
      dailyGoalMinutes: z.coerce.number().int().min(0).max(1440).optional(),
      preferredTime: z.enum(["Morning", "Afternoon", "Evening", "Night"]).optional(),
      availableHours: z.coerce.number().min(0).max(16).optional(),
      breakMinutes: z.coerce.number().int().min(5).max(60).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid preferences", errors: parsed.error.flatten() });
    const preferences = parsed.data;
    const updates = {};
    Object.entries(preferences).forEach(([key, value]) => { updates[`preferences.${key}`] = value; });
    const user = await User.findByIdAndUpdate(req.user.userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Preferences updated", data: user.preferences });
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
      Subject.deleteMany({ userId: req.user.userId }),
      StudyPlan.deleteMany({ userId: req.user.userId }),
      StudyActivity.deleteMany({ userId: req.user.userId }),
      AIAnalysis.deleteMany({ userId: req.user.userId }),
      User.findByIdAndDelete(req.user.userId),
    ]);
    res.json({ message: "Account and associated data deleted" });
  } catch (error) { next(error); }
};
