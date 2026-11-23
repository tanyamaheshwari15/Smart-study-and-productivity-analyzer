import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  provider: { type: String, enum: ["gemini", "deterministic"], required: true },
  status: { type: String, enum: ["generated", "fallback", "failed"], default: "generated" },
  dataPeriodStart: { type: Date, required: true },
  dataPeriodEnd: { type: Date, required: true },
  recordCounts: { type: mongoose.Schema.Types.Mixed, default: {} },
  summary: { type: String, trim: true, maxlength: 3000, default: "" },
  insights: { type: [mongoose.Schema.Types.Mixed], default: [] },
  recommendations: { type: [String], default: [] },
  evidence: { type: [mongoose.Schema.Types.Mixed], default: [] },
  warnings: { type: [mongoose.Schema.Types.Mixed], default: [] },
  rawProviderResponse: { type: mongoose.Schema.Types.Mixed, default: undefined, select: false },
}, { timestamps: true });

aiAnalysisSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("AIAnalysis", aiAnalysisSchema);
