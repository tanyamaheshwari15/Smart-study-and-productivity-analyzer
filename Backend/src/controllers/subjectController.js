import { z } from "zod";
import Subject from "../models/Subject.js";

const subjectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  examDate: z.coerce.date().optional().nullable(),
  weeklyTargetMinutes: z.coerce.number().int().min(0).max(10080).optional(),
  archived: z.boolean().optional(),
});

export const listSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.userId }).sort({ priority: -1, name: 1 });
    res.json({ data: subjects });
  } catch (error) { next(error); }
};

export const createSubject = async (req, res, next) => {
  try {
    const parsed = subjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid subject", errors: parsed.error.flatten() });
    const subject = await Subject.create({ ...parsed.data, userId: req.user.userId });
    res.status(201).json({ message: "Subject created", data: subject });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "A subject with this name already exists" });
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const parsed = subjectSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid subject", errors: parsed.error.flatten() });
    const subject = await Subject.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, parsed.data, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject updated", data: subject });
  } catch (error) { next(error); }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted" });
  } catch (error) { next(error); }
};
