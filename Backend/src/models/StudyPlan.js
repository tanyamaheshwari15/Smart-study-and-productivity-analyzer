import mongoose from "mongoose";

const plannedSessionSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  subjectName: { type: String, required: true, trim: true, maxlength: 80 },
  startAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, min: 5, max: 720 },
  breakMinutes: { type: Number, min: 0, max: 120, default: 10 },
  objective: { type: String, required: true, trim: true, maxlength: 500 },
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: ["draft", "accepted", "regenerated", "archived"], default: "draft", index: true },
  provider: { type: String, enum: ["gemini", "deterministic"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  sessions: { type: [plannedSessionSchema], default: [] },
  inputSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  explanation: { type: String, trim: true, maxlength: 2000, default: "" },
  adaptationReason: { type: String, trim: true, maxlength: 1000, default: "" },
}, { timestamps: true });

studyPlanSchema.index({ userId: 1, status: 1, createdAt: -1 });
export default mongoose.model("StudyPlan", studyPlanSchema);
