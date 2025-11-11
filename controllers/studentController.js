import Complaint from "../models/complaint.js";
import Booking from "../models/booking.js";
import Student from "../models/student.js";
import Room from "../models/room.js";
import Notice from "../models/noticeModel.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import Visitor from "../models/visitor.js";
import Leave from "../models/leave.js";
import Maintenance from "../models/maintenance.js";



/* ===========================================================
   🏠 STUDENT DASHBOARD
=========================================================== */
export const getStudentDashboard = async (req, res) => {
  try {
    // Get logged-in student
    const student = await Student.findOne({
      user: req.session.user._id,
    }).lean();

    // If no student found, redirect gracefully
    if (!student) {
      req.flash("error", "Student profile not found!");
      return res.redirect("/login");
    }

    // Use try-catch per section to avoid total crash
    let maintenance = [];
    let visitors = [];
    let notices = [];

    try {
      maintenance = await Maintenance.find({ student: student._id })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn("⚠️ Maintenance fetch failed:", err.message);
    }

    try {
      visitors = await Visitor.find({ student: student._id })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn("⚠️ Visitor fetch failed:", err.message);
    }

    try {
      notices = await Notice.find().sort({ createdAt: -1 }).limit(5).lean();
    } catch (err) {
      console.warn("⚠️ Notice fetch failed:", err.message);
    }

    const leaves = await Leave.find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    // Render dashboard safely
    res.render("dashboard/student_dashboard", {
      title: "Student Dashboard",
      user: req.session.user,
      student,
      maintenance: maintenance || [], // ✅ always defined
      visitors: visitors || [], // ✅ always defined
      notices: notices || [], // ✅ always defined
      complaintsPending: 0,
      approvedLeaves: 0,
      leaves: leaves || [],
    });
  } catch (error) {
    console.error("❌ Error loading student dashboard:", error);
    res.status(500).render("pages/error500", {
      title: "Server Error",
      error,
    });
  }
};

/* ===========================================================
   👤 STUDENT PROFILE
=========================================================== */
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.session.user._id,
    }).populate("user");

    if (!student) {
      return res
        .status(404)
        .render("pages/error404", { title: "Profile Not Found" });
    }

    const bookings = await Booking.find({ student: student._id }).lean();
    const complaints = await Complaint.find({ student: student._id }).lean();

    res.render("pages/profile", {
      title: "My Profile",
      user: req.session.user,
      student,
      bookings,
      complaints,
    });
  } catch (error) {
    console.error("🔥 Error loading student profile:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* ===========================================================
   ✏️ UPDATE PROFILE
=========================================================== */
export const updateStudentProfile = async (req, res) => {
  try {
    const { hostelName, roomNumber, feeStatus } = req.body;
    await Student.findOneAndUpdate(
      { user: req.session.user._id },
      { hostelName, roomNumber, feeStatus }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Error updating profile:", error);
    res.status(500).json({ success: false });
  }
};

/* ===========================================================
   📸 UPDATE PROFILE PICTURE
=========================================================== */
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const student = await Student.findOne({ user: req.session.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.profileImage = `/uploads/profile_pics/${req.file.filename}`;
    await student.save();

    res.status(200).json({
      success: true,
      imageUrl: student.profileImage,
    });
  } catch (err) {
    console.error("🔥 Error uploading image:", err);
    res.status(500).json({ success: false });
  }
};

/* ===========================================================
   📋 COMPLAINTS
=========================================================== */
export const getComplaints = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });
    const complaints = await Complaint.find({ student: student._id }).lean();

    res.render("pages/complaints", {
      title: "Complaints",
      user: req.session.user,
      complaints,
    });
  } catch (error) {
    console.error("❌ Error loading complaints:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

export const postComplaint = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });

    await Complaint.create({
      student: student._id,
      studentName: req.session.user.name,
      subject: req.body.subject,
      description: req.body.description,
      status: "open",
    });

    req.flash("success", "Complaint submitted successfully!");
    res.redirect("/student/complaints");
  } catch (error) {
    console.error("❌ Error submitting complaint:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* ===========================================================
   🧾 STUDENT VISITOR MANAGEMENT
=========================================================== */
export const getStudentVisitors = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id }).lean();
    if (!student) {
      req.flash("error", "Student profile not found!");
      return res.redirect("/login");
    }

    const visitors = await Visitor.find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    res.render("student/visitors", {
      title: "My Visitors",
      user: req.session.user,
      visitors,
    });
  } catch (error) {
    console.error("🔥 Error loading visitors:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

export const postVisitorRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });
    if (!student) {
      req.flash("error", "Student profile not found!");
      return res.redirect("/login");
    }

    const { name, contact, purpose, inTime, outTime } = req.body;

    await Visitor.create({
      name,
      contact,
      purpose,
      inTime,
      outTime,
      student: student._id,
      status: "Pending",
    });

    req.flash("success", "Visitor request submitted successfully!");
    res.redirect("/student/visitors");
  } catch (error) {
    console.error("🔥 Error submitting visitor request:", error);
    req.flash("error", "Failed to submit visitor request.");
    res.redirect("/student/visitors");
  }
};

/* ===========================================================
   🏠 ROOMS & BOOKINGS
=========================================================== */
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.render("student/rooms", {
      title: "Available Rooms",
      user: req.session.user,
      rooms,
    });
  } catch (error) {
    console.error("❌ Error loading rooms:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

export const getBookings = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.session.user._id,
    }).lean();
    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/login");
    }

    const bookings = await Booking.find({ student: student._id }).lean();
    const vacantRoomsList = await Room.find({ isOccupied: false }).lean();

    res.render("student/bookings", {
      title: "My Bookings",
      user: req.session.user,
      bookings,
      vacantRoomsList,
    });
  } catch (error) {
    console.error("❌ Error loading bookings:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

export const createBooking = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });
    const { roomNumber } = req.body;

    const room = await Room.findOne({ roomNumber });
    if (!room || room.isOccupied) {
      return res.status(400).json({ error: "Room not available" });
    }

    await Booking.create({
      student: student._id,
      studentName: req.session.user.name,
      roomNumber,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(200).json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending bookings can be canceled" });
    }

    booking.status = "canceled";
    await booking.save();

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error("❌ Error canceling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

/* ===========================================================
   💰 FEES & PAYMENTS (RAZORPAY)
=========================================================== */
export const getFees = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.session.user._id,
    }).lean();
    if (!student) {
      req.flash("error", "Student record not found!");
      return res.redirect("/login");
    }

    const fees = {
      totalDue: 5000,
      lastPaymentDate: student.lastPaymentDate || new Date(),
      totalPaid: student.totalFeesPaid || 0,
      status: student.feeStatus || "Not set",
    };

    res.render("pages/fees", {
      title: "Fees",
      user: req.session.user,
      student,
      fees,
    });
  } catch (error) {
    console.error("❌ Error loading fees:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// 💳 Fee Payment Page
export const getFeePayment = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.session.user._id,
    }).lean();
    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/login");
    }

    res.render("pages/fees_pay", {
      title: "Pay Fees",
      user: req.session.user,
      student,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error loading fee payment page:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// 🧾 Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 5000 * 100, // ₹5000
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// ✅ Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const student = await Student.findOne({ user: req.session.user._id });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const payment = {
      paymentId: razorpay_payment_id,
      amount: 5000,
      status: "Paid",
      date: new Date(),
    };

    student.totalFeesPaid = (student.totalFeesPaid || 0) + 5000;
    student.feeStatus = "Paid";
    student.lastPaymentDate = new Date();
    student.payments = [...(student.payments || []), payment];
    await student.save();

    res.json({ success: true, message: "Payment verified successfully!" });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ success: false });
  }
};
