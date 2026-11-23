import express from "express";
import authRoutes from "./authRoutes.js";
import sampleRoutes from "./sampleRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import aiRoutes from "./aiRoutes.js";
import dataRoutes from "./dataRoutes.js";
import subjectRoutes from "./subjectRoutes.js";
import planRoutes from "./planRoutes.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ message: "✓ Server is running" });
});

// Auth routes
router.use("/auth", authRoutes);

// Sample feature routes
router.use("/sample", sampleRoutes);

// Dashboard route
router.use("/dashboard", dashboardRoutes);

// AI insight route
router.use("/ai", aiRoutes);
router.use("/data", dataRoutes);
router.use("/subjects", subjectRoutes);
router.use("/plans", planRoutes);

export default router;
