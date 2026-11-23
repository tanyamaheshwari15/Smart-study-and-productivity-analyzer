import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { listSubjects, createSubject, updateSubject, deleteSubject } from "../controllers/subjectController.js";

const router = express.Router();
router.use(authenticateToken);
router.get("/", listSubjects);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
export default router;
