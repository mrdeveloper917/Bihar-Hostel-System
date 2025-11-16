// routes/leaveRoutes.js
import express from "express";
import { getLeaves, applyLeave } from "../controllers/leaveController.js";
import { protectStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

// Show student's leave page + list
router.get("/student/leaves", protectStudent, getLeaves);

// Apply for leave
router.post("/student/leaves", protectStudent, applyLeave);

// Cancel leave (student)
router.post("/student/leaves/:id/cancel", protectStudent);

export default router;
