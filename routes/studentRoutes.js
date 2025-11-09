import express from "express";
import {
  getStudentDashboard,
  getComplaints,
  postComplaint,
  getRooms,
  getBookings,
  createBooking,
  cancelBooking,
  getFees,
  getFeePayment,
  createOrder,
  verifyPayment,
  getStudentProfile,
  updateStudentProfile,
  updateProfilePicture,
} from "../controllers/studentController.js";

import { protectStudent } from "../middleware/authMiddleware.js";
import { upload } from "../config/multerConfig.js";

const router = express.Router();

/* ===========================================================
   🏠 DASHBOARD
=========================================================== */
router.get("/", protectStudent, getStudentDashboard);

/* ===========================================================
   📋 COMPLAINTS
=========================================================== */
router.get("/complaints", protectStudent, getComplaints);
router.post("/complaints", protectStudent, postComplaint);

/* ===========================================================
   🏠 ROOMS
=========================================================== */
router.get("/rooms", protectStudent, getRooms);

/* ===========================================================
   📚 BOOKINGS
=========================================================== */
router.get("/bookings", protectStudent, getBookings);
router.post("/bookings", protectStudent, createBooking);
router.post("/bookings/:id/cancel", protectStudent, cancelBooking);

/* ===========================================================
   💰 FEES & PAYMENTS (RAZORPAY)
=========================================================== */
// View fees summary
router.get("/fees", protectStudent, getFees);

// Payment page (Razorpay checkout)
router.get("/pay", protectStudent, getFeePayment);

// Create Razorpay order (called from frontend)
router.post("/create-order", protectStudent, createOrder);

// Verify payment after success
router.post("/verify-payment", protectStudent, verifyPayment);

/* ===========================================================
   👤 PROFILE
=========================================================== */
router.get("/profile", protectStudent, getStudentProfile);
router.post("/update-profile", protectStudent, updateStudentProfile);

// Upload profile photo
router.post(
  "/upload-photo",
  protectStudent,
  upload.single("profilePic"),
  updateProfilePicture
);

export default router;
