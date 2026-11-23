import mongoose from "mongoose";

const studyActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyPlan" },
  title: { type: String, trim: true, required: true, maxlength: 120 },
  startAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, min: 5, max: 720 },
  objective: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["planned", "completed", "missed", "postponed"], default: "planned", index: true },
  studySessionId: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession" },
  reason: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

studyActivitySchema.index({ userId: 1, startAt: 1 });
export default mongoose.model("StudyActivity", studyActivitySchema);
