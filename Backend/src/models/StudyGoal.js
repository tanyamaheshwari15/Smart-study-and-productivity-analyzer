import mongoose from "mongoose";

const studyGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    targetHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const StudyGoal = mongoose.model("StudyGoal", studyGoalSchema);
export default StudyGoal;
