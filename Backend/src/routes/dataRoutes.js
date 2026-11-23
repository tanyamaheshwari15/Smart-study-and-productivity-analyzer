import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { createSession, deleteSession, createGoal, updateGoal, deleteGoal, updateProfile, deleteAccount } from "../controllers/dataController.js";

const router = express.Router();
router.use(authenticateToken);
router.post("/sessions", createSession);
router.delete("/sessions/:id", deleteSession);
router.post("/goals", createGoal);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);
router.put("/profile", updateProfile);
router.delete("/account", deleteAccount);

export default router;
