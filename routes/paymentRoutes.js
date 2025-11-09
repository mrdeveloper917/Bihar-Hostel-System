import express from "express";
import {
  createOrder,
  verifyPayment,
  downloadReceipt,
} from "../controllers/paymentController.js";
import { protectStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", protectStudent, createOrder);

// Verify payment after success
router.post("/verify-payment", protectStudent, verifyPayment);

// Download fee receipt
router.get("/receipt/:paymentId", protectStudent, downloadReceipt);

export default router;
