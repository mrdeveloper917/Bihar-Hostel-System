import express from "express";
import {
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from "../controllers/adminLeaveController.js";

const router = express.Router();

// 📄 Admin Leave Routes
router.get("/admin/leaves", getAllLeaves);
router.get("/admin/leaves/approve/:id", approveLeave);
router.get("/admin/leaves/reject/:id", rejectLeave);

export default router;
