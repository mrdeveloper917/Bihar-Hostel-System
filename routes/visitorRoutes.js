import express from "express";
import {
  addVisitor,
  approveVisitor,
  checkoutVisitor,
  getAllVisitors,
  getSecurityVisitors,
} from "../controllers/visitorController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👮‍♂️ Security Routes
router.get("/security/visitors", getSecurityVisitors);
router.post("/security/visitors/add", addVisitor);
router.post("/security/visitors/:id/approve", approveVisitor);
router.post("/security/visitors/:id/checkout", checkoutVisitor);

// 👨‍💼 Admin Routes
router.get("/admin/visitors", protectAdmin, getAllVisitors);

export default router;
