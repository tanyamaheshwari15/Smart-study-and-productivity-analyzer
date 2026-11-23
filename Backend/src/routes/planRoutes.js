import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { generatePlan, listPlans, updatePlan, updateActivityStatus, listActivities } from "../controllers/planController.js";

const router = express.Router();
router.use(authenticateToken);
router.post("/", generatePlan);
router.get("/", listPlans);
router.put("/:id", updatePlan);
router.get("/activities", listActivities);
router.put("/activities/:id/status", updateActivityStatus);
export default router;
