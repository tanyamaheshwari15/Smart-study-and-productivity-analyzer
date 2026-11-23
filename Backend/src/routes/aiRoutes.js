import express from "express";
import { analyzeStudyHabits, listAnalyses } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/insights", authenticateToken, analyzeStudyHabits);
router.post("/analyze", authenticateToken, analyzeStudyHabits);
router.get("/history", authenticateToken, listAnalyses);

export default router;
