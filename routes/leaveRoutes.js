import express from "express";
import { getLeaves, applyLeave, cancelLeave } from "../controllers/leaveController.js";

const router = express.Router();

router.get("/student/leaves", getLeaves);
router.post("/student/leaves", applyLeave);
router.get("/student/leaves/cancel/:id", cancelLeave);

export default router;
