import express from "express";
import { getAIInsights } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/insights", authenticateToken, getAIInsights);
router.post("/insights", authenticateToken, getAIInsights);

export default router;
