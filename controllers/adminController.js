import Student from "../models/student.js";
import User from "../models/user.js";
import Room from "../models/room.js";
import Complaint from "../models/complaint.js";
import Booking from "../models/booking.js";
import Leave from "../models/leave.js";
import Notice from "../models/noticeModel.js";
import { createObjectCsvStringifier } from "csv-writer";

/* ===============================
   📊 ADMIN DASHBOARD
================================*/
export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ isOccupied: true });
    const vacantRooms = totalRooms - occupiedRooms;

    const pendingComplaints = await Complaint.countDocuments({
      status: "open",
    });
    const totalComplaints = await Complaint.countDocuments();
    const totalResolved = await Complaint.countDocuments({
      status: "resolved",
    });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const approvedBookings = await Booking.countDocuments({
      status: "approved",
    });

    const pendingLeaves = await Leave.countDocuments({ status: "pending" });
    const totalNotices = await Notice.countDocuments();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student")
      .lean();

    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student")
      .lean();

    const students = await Student.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.render("dashboard/admin_dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      totalStudents,
      occupiedRooms,
      vacantRooms,
      pendingComplaints,
      totalComplaints,
      totalResolved,
      totalBookings,
      pendingBookings,
      approvedBookings,
      recentBookings,
      recentComplaints,
      students,
      pendingLeaves,
      totalNotices,
    });
  } catch (err) {
    console.error("❌ Error loading admin dashboard:", err);
    res
      .status(500)
      .render("pages/error500", { title: "Server Error", error: err });
  }
};

/* ===============================
   👨‍🎓 STUDENT MANAGEMENT
================================*/
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user").lean();
    res.render("admin/students", { title: "Manage Students", students });
  } catch (err) {
    console.error("❌ Error loading students:", err);
    res.status(500).render("pages/error500", { error: err });
  }
};

// ➕ Add Student
export const addStudent = async (req, res) => {
  try {
    const { name, email, roll, hostelName, roomNumber, gender, batchYear } =
      req.body;

    if (!name || !email || !gender || !batchYear) {
      req.flash("error", "Name, Email, Gender, and Batch Year are required!");
      return res.redirect("/admin/students");
    }

    const user = await User.create({ name, email, role: "student" });
    await Student.create({
      user: user._id,
      roll,
      hostelName,
      roomNumber,
      gender,
      batchYear,
      feeStatus: "Unpaid",
    });

    req.flash("success", "Student added successfully!");
    res.redirect("/admin/students");
  } catch (err) {
    console.error("❌ Error adding student:", err);
    req.flash("error", "Failed to add student!");
    res.redirect("/admin/students");
  }
};

// ✏️ Edit Student
export const editStudent = async (req, res) => {
  try {
    const { name, email, hostelName, roomNumber, feeStatus } = req.body;
    const student = await Student.findById(req.params.id).populate("user");

    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/admin/students");
    }

    if (student.user) {
      student.user.name = name;
      student.user.email = email;
      await student.user.save();
    }

    student.hostelName = hostelName;
    student.roomNumber = roomNumber;
    student.feeStatus = feeStatus;
    await student.save();

    req.flash("success", "Student updated successfully!");
    res.redirect("/admin/students");
  } catch (err) {
    console.error("❌ Error editing student:", err);
    req.flash("error", "Failed to edit student!");
    res.redirect("/admin/students");
  }
};

// 🗑️ Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/admin/students");
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);

    req.flash("success", "Student deleted successfully!");
    res.redirect("/admin/students");
  } catch (err) {
    console.error("❌ Error deleting student:", err);
    req.flash("error", "Failed to delete student!");
    res.redirect("/admin/students");
  }
};

// 📤 Export CSV
export const exportStudentsCsv = async (req, res) => {
  try {
    const students = await Student.find().populate("user").lean();
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "roll", title: "Roll" },
        { id: "hostelName", title: "Hostel" },
        { id: "roomNumber", title: "Room" },
        { id: "feeStatus", title: "Fee" },
      ],
    });

    const records = students.map((s) => ({
      name: s.user?.name || "",
      email: s.user?.email || "",
      roll: s.roll || "",
      hostelName: s.hostelName || "",
      roomNumber: s.roomNumber || "",
      feeStatus: s.feeStatus || "Unpaid",
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students.csv");
    res.send(
      csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records)
    );
  } catch (err) {
    console.error("❌ Error exporting students:", err);
    res.status(500).render("pages/error500", { error: err });
  }
};

/* ===============================
   🏠 ROOM MANAGEMENT
================================*/
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ hostelName: 1, roomNumber: 1 })
      .lean();
    res.render("admin/rooms", {
      title: "Manage Rooms",
      user: req.session.user,
      rooms,
    });
  } catch (err) {
    console.error("❌ Error loading rooms:", err);
    res.status(500).render("pages/error500", { error: err });
  }
};

// ➕ Add Room
export const addRoom = async (req, res) => {
  try {
    const { roomNumber, hostelName, capacity, gender, batchYear } = req.body;

    if (!roomNumber || !hostelName || !gender || !batchYear) {
      req.flash(
        "error",
        "All fields are required — Room No, Hostel, Gender, and Batch Year!"
      );
      return res.redirect("/admin/rooms");
    }

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      req.flash("error", `Room ${roomNumber} already exists!`);
      return res.redirect("/admin/rooms");
    }

    await Room.create({
      roomNumber,
      hostelName,
      capacity,
      gender,
      batchYear,
      isOccupied: false,
      occupants: [],
      status: "vacant",
    });

    req.flash("success", `Room ${roomNumber} added successfully!`);
    res.redirect("/admin/rooms");
  } catch (err) {
    console.error("❌ Error adding room:", err);
    req.flash("error", "Failed to add room. Please try again.");
    res.redirect("/admin/rooms");
  }
};

// 🔄 Toggle Room Status
export const toggleRoomStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      req.flash("error", "Room not found!");
      return res.redirect("/admin/rooms");
    }

    room.isOccupied = !room.isOccupied;
    room.status = room.isOccupied ? "full" : "vacant";
    await room.save();

    req.flash("success", `Room ${room.roomNumber} marked as ${room.status}.`);
    res.redirect("/admin/rooms");
  } catch (err) {
    console.error("❌ Error toggling room status:", err);
    req.flash("error", "Failed to update room status!");
    res.redirect("/admin/rooms");
  }
};

// 🗑️ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      req.flash("error", "Room not found!");
      return res.redirect("/admin/rooms");
    }

    // Prevent deletion if room has occupants
    if (room.occupants && room.occupants.length > 0) {
      req.flash("error", "Cannot delete room while it has occupants!");
      return res.redirect("/admin/rooms");
    }

    await Room.findByIdAndDelete(req.params.id);
    req.flash("success", `Room ${room.roomNumber} deleted successfully!`);
    res.redirect("/admin/rooms");
  } catch (err) {
    console.error("❌ Error deleting room:", err);
    req.flash("error", "Failed to delete room!");
    res.redirect("/admin/rooms");
  }
};

// 🧠 Smart Auto Room Allotment
export const autoAllotRoom = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/admin/students");
    }

    if (!student.gender || !student.batchYear) {
      req.flash(
        "error",
        "Student gender or batch year missing. Update profile first!"
      );
      return res.redirect("/admin/students");
    }

    const room = await Room.findOne({
      gender: student.gender,
      batchYear: student.batchYear,
      status: { $in: ["vacant", "partial"] },
    });

    if (!room) {
      req.flash("error", "No suitable vacant room found for this student.");
      return res.redirect("/admin/students");
    }

    room.occupants.push(student._id);
    room.status = room.occupants.length >= room.capacity ? "full" : "partial";
    room.isOccupied = room.status === "full";
    await room.save();

    student.roomNumber = room.roomNumber;
    student.hostelName = room.hostelName;
    await student.save();

    req.flash("success", `🎉 Room ${room.roomNumber} allotted successfully!`);
    res.redirect("/admin/students");
  } catch (error) {
    console.error("❌ Error auto-allocating room:", error);
    req.flash("error", "Failed to auto-allocate room!");
    res.redirect("/admin/students");
  }
};

// 🏢 Room Dashboard
export const getRoomDashboard = async (req, res) => {
  try {
    const rooms = await Room.find().populate("occupants", "name").lean();
    res.render("admin/rooms_dashboard", {
      title: "Room Dashboard",
      user: req.session.user,
      rooms,
    });
  } catch (error) {
    console.error("❌ Error loading room dashboard:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* ===============================
   📦 BOOKINGS MANAGEMENT
================================*/
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("student").lean();
    res.render("admin/bookings", {
      title: "Manage Bookings",
      bookings,
      user: req.session.user,
    });
  } catch (err) {
    console.error("🔥 Error loading bookings:", err);
    res.status(500).render("pages/error500", { error: err });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking not found");

    booking.status = "approved";
    await booking.save();

    await Room.findOneAndUpdate(
      { roomNumber: booking.roomNumber },
      { isOccupied: true }
    );

    req.flash("success", `Booking #${booking._id} approved successfully!`);
    res.redirect("/admin/bookings");
  } catch (err) {
    console.error("🔥 Error approving booking:", err);
    req.flash("error", "Failed to approve booking.");
    res.redirect("/admin/bookings");
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking not found");

    booking.status = "rejected";
    await booking.save();

    req.flash("success", `Booking #${booking._id} rejected.`);
    res.redirect("/admin/bookings");
  } catch (err) {
    console.error("🔥 Error rejecting booking:", err);
    req.flash("error", "Failed to reject booking.");
    res.redirect("/admin/bookings");
  }
};

/* ===============================
   🧾 COMPLAINTS MANAGEMENT
================================*/
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student")
      .sort({ createdAt: -1 })
      .lean();
    res.render("admin/complaints", {
      title: "Manage Complaints",
      complaints,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading complaints:", err);
    res.status(500).send("Server Error");
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: "resolved" });
    req.flash("success", "Complaint marked as resolved!");
    res.redirect("/admin/complaints");
  } catch (err) {
    console.error("Error resolving complaint:", err);
    req.flash("error", "Failed to resolve complaint!");
    res.redirect("/admin/complaints");
  }
};

/* ===============================
   🧾 LEAVE MANAGEMENT
================================*/
export const getAdminLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/leaves", {
      title: "Manage Leave Requests",
      user: req.session.user,
      leaves,
    });
  } catch (error) {
    console.error("❌ Error loading leaves:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

export const approveLeave = async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: "approved" });
    req.flash("success", "Leave approved successfully!");
    res.redirect("/admin/leaves");
  } catch (error) {
    console.error("❌ Error approving leave:", error);
    req.flash("error", "Failed to approve leave.");
    res.redirect("/admin/leaves");
  }
};

export const rejectLeave = async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: "rejected" });
    req.flash("success", "Leave rejected successfully!");
    res.redirect("/admin/leaves");
  } catch (error) {
    console.error("❌ Error rejecting leave:", error);
    req.flash("error", "Failed to reject leave.");
    res.redirect("/admin/leaves");
  }
};
