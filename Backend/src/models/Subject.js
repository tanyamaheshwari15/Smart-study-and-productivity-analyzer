import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  color: { type: String, trim: true, default: "#6ea0b5" },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  priority: { type: Number, min: 1, max: 5, default: 3 },
  examDate: { type: Date },
  weeklyTargetMinutes: { type: Number, min: 0, default: 0 },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

subjectSchema.index({ userId: 1, name: 1 }, { unique: true });
export default mongoose.model("Subject", subjectSchema);
