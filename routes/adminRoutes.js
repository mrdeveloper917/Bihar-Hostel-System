import express from "express";
import {
  // ===== Dashboard =====
  getAdminDashboard,

  // ===== Students =====
  getStudents,
  addStudent,
  editStudent,
  deleteStudent,
  exportStudentsCsv,
  autoAllotRoom,

  // ===== Rooms =====
  getRooms,
  addRoom,
  toggleRoomStatus,
  deleteRoom,
  getRoomDashboard,

  // ===== Bookings =====
  getBookings,
  approveBooking,
  rejectBooking,

  // ===== Complaints =====
  getComplaints,
  resolveComplaint,

  // ===== Leaves =====
  getAdminLeaves,
  approveLeave,
  rejectLeave,
} from "../controllers/adminController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   🧭 ADMIN DASHBOARD
============================ */
router.get("/", protectAdmin, getAdminDashboard);

/* ============================
   👨‍🎓 STUDENT MANAGEMENT
============================ */
router.get("/students", protectAdmin, getStudents);
router.post("/students/add", protectAdmin, addStudent);
router.post("/students/:id/edit", protectAdmin, editStudent);
router.post("/students/:id/delete", protectAdmin, deleteStudent);
router.get("/students/export", protectAdmin, exportStudentsCsv);
router.post("/students/auto-allot/:studentId", protectAdmin, autoAllotRoom);

/* ============================
   🏠 ROOM MANAGEMENT
============================ */
router.get("/rooms", protectAdmin, getRooms);
router.post("/rooms/add", protectAdmin, addRoom);
router.post("/rooms/:id/toggle", protectAdmin, toggleRoomStatus);
router.post("/rooms/:id/delete", protectAdmin, deleteRoom);
router.get("/rooms/dashboard", protectAdmin, getRoomDashboard);

/* ============================
   📦 BOOKING MANAGEMENT
============================ */
router.get("/bookings", protectAdmin, getBookings);
router.post("/bookings/:id/approve", protectAdmin, approveBooking);
router.post("/bookings/:id/reject", protectAdmin, rejectBooking);

/* ============================
   🧾 COMPLAINT MANAGEMENT
============================ */
router.get("/complaints", protectAdmin, getComplaints);
router.post("/complaints/:id/resolve", protectAdmin, resolveComplaint);

/* ============================
   📅 LEAVE MANAGEMENT
============================ */
router.get("/leaves", protectAdmin, getAdminLeaves);
router.post("/leaves/approve/:id", protectAdmin, approveLeave);
router.post("/leaves/reject/:id", protectAdmin, rejectLeave);

export default router;
