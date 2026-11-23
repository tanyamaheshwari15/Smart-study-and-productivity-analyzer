import axios from "axios";
import { z } from "zod";
import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import StudyActivity from "../models/StudyActivity.js";

const inputSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  availableHoursPerDay: z.coerce.number().min(0.5).max(16),
  breakMinutes: z.coerce.number().int().min(5).max(60).default(10),
  preferredTime: z.enum(["Morning", "Afternoon", "Evening", "Night"]),
  subjectIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).max(12),
});

const validatePlanSessions = (sessions, subjects, input) => {
  if (!Array.isArray(sessions) || !sessions.length) throw new Error("Gemini did not return any study sessions");
  const subjectByName = new Map(subjects.map((subject) => [subject.name.toLowerCase(), subject]));
  const normalized = [];
  for (const item of sessions) {
    if (!item?.subjectName || !item?.startAt || !item?.durationMinutes || !item?.objective) {
      throw new Error("The generated plan contains incomplete sessions");
    }
    const subject = subjectByName.get(String(item.subjectName).trim().toLowerCase());
    if (!subject) throw new Error(`Generated plan references unknown subject: ${item.subjectName}`);
    const start = new Date(item.startAt);
    const duration = Number(item.durationMinutes);
    const breakMinutes = Number(item.breakMinutes || input.breakMinutes);
    if (Number.isNaN(start.getTime()) || duration < 5 || duration > 720) throw new Error("Generated plan contains invalid timing");
    if (start < new Date(input.startDate) || start > new Date(input.endDate)) throw new Error("Generated plan session is outside the requested date range");
    const end = new Date(start.getTime() + duration * 60000);
    if (normalized.some((existing) => start < existing.end && end > existing.start)) throw new Error("Generated plan contains overlapping sessions");
    normalized.push({
      subjectId: subject._id,
      subjectName: subject.name,
      startAt: start,
      durationMinutes: duration,
      breakMinutes: Math.min(60, Math.max(5, breakMinutes)),
      objective: String(item.objective).slice(0, 500),
      end,
      start,
    });
  }
  const daily = {};
  normalized.forEach((item) => {
    const key = item.startAt.toISOString().slice(0, 10);
    daily[key] = (daily[key] || 0) + item.durationMinutes;
  });
  const maxMinutes = input.availableHoursPerDay * 60;
  if (Object.values(daily).some((minutes) => minutes > maxMinutes)) throw new Error("Generated plan exceeds daily availability");
  return normalized.map(({ end, start, ...item }) => item);
};

const deterministicPlan = (subjects, input) => {
  const sessions = [];
  let cursor = new Date(input.startDate);
  cursor.setHours(input.preferredTime === "Morning" ? 8 : input.preferredTime === "Afternoon" ? 14 : input.preferredTime === "Night" ? 20 : 18, 0, 0, 0);
  const perSession = Math.min(90, Math.round(input.availableHoursPerDay * 60 / Math.max(1, subjects.length)));
  let subjectIndex = 0;
  while (cursor <= input.endDate && sessions.length < 14) {
    if (cursor.getDay() !== 0) {
      const subject = subjects[subjectIndex % subjects.length];
      sessions.push({ subjectId: subject._id, subjectName: subject.name, startAt: new Date(cursor), durationMinutes: perSession, breakMinutes: input.breakMinutes, objective: `Review priority work for ${subject.name}` });
      subjectIndex += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return sessions;
};

export const generatePlan = async (req, res, next) => {
  try {
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid study plan input", errors: parsed.error.flatten() });
    const input = parsed.data;
    if (input.endDate < input.startDate) return res.status(400).json({ message: "End date must not be before start date" });
    const subjects = await Subject.find({ _id: { $in: input.subjectIds }, userId: req.user.userId, archived: false }).sort({ priority: -1 });
    if (subjects.length !== input.subjectIds.length) return res.status(400).json({ message: "One or more subjects do not belong to this account" });

    let sessions = null;
    let provider = "deterministic";
    let explanation = "Deterministic plan generated from subject priorities and availability because Gemini was unavailable or not configured.";
    const key = process.env.GEMINI_API_KEY;
    if (process.env.AI_PROVIDER === "gemini" && key) {
      const prompt = `Generate a structured study timetable JSON only. Input: ${JSON.stringify({ ...input, subjects: subjects.map((s) => ({ id:String(s._id), name:s.name, difficulty:s.difficulty, priority:s.priority, examDate:s.examDate })) })}. Return keys title, explanation, sessions (array of subjectName,startAt ISO,durationMinutes,breakMinutes,objective). Respect start/end dates, availability, breaks, and deadlines. Do not overlap sessions.`;
      try {
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
          contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }, { timeout: 15000 });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsedResult = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/i, ""));
          sessions = validatePlanSessions(parsedResult.sessions, subjects, input);
          provider = "gemini";
          explanation = String(parsedResult.explanation || "Gemini-generated plan based on subject priorities, deadlines, and availability.").slice(0, 2000);
        }
      } catch (error) {
        console.warn("Gemini plan unavailable:", error.response?.status || error.code || error.message);
      }
    }

    if (!sessions) sessions = validatePlanSessions(deterministicPlan(subjects, input), subjects, input);
    const plan = await StudyPlan.create({
      userId: req.user.userId,
      title: input.title || `Study plan ${new Date(input.startDate).toLocaleDateString()}`,
      status: "draft", provider, startDate: input.startDate, endDate: input.endDate,
      sessions, inputSnapshot: input, explanation,
    });
    res.status(201).json({ message: provider === "gemini" ? "Gemini study plan generated" : "Study plan generated using deterministic fallback", data: plan });
  } catch (error) { next(error); }
};

export const listPlans = async (req, res, next) => {
  try { res.json({ data: await StudyPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20) }); } catch (error) { next(error); }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    const updateSchema = z.object({ title: z.string().trim().min(1).max(120).optional(), status: z.enum(["draft", "accepted", "archived"]).optional(), sessions: z.array(z.object({ subjectId:z.string().regex(/^[0-9a-fA-F]{24}$/), subjectName:z.string().trim().min(1).max(80), startAt:z.coerce.date(), durationMinutes:z.coerce.number().int().min(5).max(720), breakMinutes:z.coerce.number().int().min(5).max(60), objective:z.string().trim().min(1).max(500) })).optional(), adaptationReason:z.string().trim().max(1000).optional() });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid plan update", errors: parsed.error.flatten() });
    if (parsed.data.sessions) {
      const subjects = await Subject.find({ _id: { $in: parsed.data.sessions.map((s) => s.subjectId) }, userId: req.user.userId });
      if (new Set(subjects.map((subject) => String(subject._id))).size !== new Set(parsed.data.sessions.map((session) => session.subjectId)).size) {
        return res.status(400).json({ message: "One or more plan subjects do not belong to this account" });
      }
      const input = { ...plan.inputSnapshot, startDate: plan.startDate, endDate: plan.endDate };
      parsed.data.sessions = validatePlanSessions(parsed.data.sessions, subjects, input);
    }

    if (parsed.data.status === "accepted") {
      if (plan.status === "accepted") {
        return res.json({ message: "Study plan is already accepted", data: plan });
      }
      const acceptedPlan = await StudyPlan.findOneAndUpdate(
        { _id: plan._id, userId: req.user.userId, status: "draft" },
        { $set: { ...parsed.data, status: "accepted" } },
        { new: true, runValidators: true },
      );
      if (!acceptedPlan) {
        const latestPlan = await StudyPlan.findOne({ _id: plan._id, userId: req.user.userId });
        if (latestPlan?.status === "accepted") {
          return res.json({ message: "Study plan is already accepted", data: latestPlan });
        }
        return res.status(409).json({ message: "Study plan is no longer available to accept" });
      }

      await StudyActivity.insertMany(acceptedPlan.sessions.map((session) => ({
        userId: req.user.userId,
        subjectId: session.subjectId,
        studyPlanId: acceptedPlan._id,
        title: `${session.subjectName} study`,
        startAt: session.startAt,
        durationMinutes: session.durationMinutes,
        objective: session.objective,
        status: "planned",
      })));
      return res.json({ message: "Study plan accepted", data: acceptedPlan });
    }

    if (plan.status === "accepted" && parsed.data.sessions) {
      await StudyActivity.updateMany(
        { studyPlanId: plan._id, status: "planned" },
        { $set: { status: "postponed", reason: "Plan replaced by an edited version" } },
      );
    }
    Object.assign(plan, parsed.data);
    await plan.save();
    if (plan.status === "accepted" && parsed.data.sessions) {
      await StudyActivity.insertMany(plan.sessions.map((session) => ({
        userId: req.user.userId,
        subjectId: session.subjectId,
        studyPlanId: plan._id,
        title: `${session.subjectName} study`,
        startAt: session.startAt,
        durationMinutes: session.durationMinutes,
        objective: session.objective,
        status: "planned",
      })));
    }
    res.json({ message: "Study plan updated", data: plan });
  } catch (error) { next(error); }
};

export const updateActivityStatus = async (req, res, next) => {
  try {
    const schema = z.object({ status: z.enum(["completed", "missed", "postponed"]), reason: z.string().trim().max(500).optional(), studySessionId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid activity status", errors: parsed.error.flatten() });
    const activity = await StudyActivity.findOne({ _id:req.params.id, userId:req.user.userId });
    if (!activity) return res.status(404).json({ message: "Study activity not found" });
    activity.status = parsed.data.status;
    activity.reason = parsed.data.reason || `${parsed.data.status} by user`;
    if (parsed.data.studySessionId) activity.studySessionId = parsed.data.studySessionId;
    await activity.save();

    let adaptation = {
      summary: parsed.data.status === "completed"
        ? "Completed activity preserved in history; no upcoming activity was overwritten."
        : `Upcoming schedule reviewed after activity was marked ${parsed.data.status}.`,
      preserveHistory: true,
      changes: [],
    };

    if (parsed.data.status === "postponed" || parsed.data.status === "missed") {
      const proposedStart = new Date(activity.startAt);
      proposedStart.setDate(proposedStart.getDate() + 1);
      const occupied = await StudyActivity.find({
        userId: req.user.userId,
        status: "planned",
        startAt: { $gte: new Date(proposedStart.toISOString().slice(0, 10)), $lt: new Date(new Date(proposedStart.toISOString().slice(0, 10)).getTime() + 86400000) },
      });
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const proposedEnd = new Date(proposedStart.getTime() + activity.durationMinutes * 60000);
        const overlap = occupied.some((item) => proposedStart < new Date(item.startAt).getTime() + item.durationMinutes * 60000 && proposedEnd > new Date(item.startAt));
        if (!overlap) break;
        proposedStart.setMinutes(proposedStart.getMinutes() + 30);
      }
      const replacement = await StudyActivity.create({
        userId: req.user.userId,
        subjectId: activity.subjectId,
        studyPlanId: activity.studyPlanId,
        title: activity.title,
        startAt: proposedStart,
        durationMinutes: activity.durationMinutes,
        objective: activity.objective,
        status: "planned",
        reason: `Rescheduled because the prior session was marked ${parsed.data.status}: ${activity.reason}`,
      });
      adaptation.changes.push({
        action: "rescheduled",
        originalActivityId: activity._id,
        replacementActivityId: replacement._id,
        newStartAt: proposedStart,
        reason: `Moved to a non-overlapping slot after the session was marked ${parsed.data.status}.`,
      });
    }

    res.json({ message: `Study activity marked ${parsed.data.status}`, data: activity, adaptation });
  } catch (error) { next(error); }
};

export const listActivities = async (req, res, next) => {
  try { res.json({ data: await StudyActivity.find({ userId:req.user.userId }).sort({ startAt: 1 }) }); } catch (error) { next(error); }
};
