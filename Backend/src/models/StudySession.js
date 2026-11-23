import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      trim: true,
      default: "General study",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    distractionMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    focusScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isCompleted: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
