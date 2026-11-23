import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", authenticateToken, getDashboardData);

export default router;
