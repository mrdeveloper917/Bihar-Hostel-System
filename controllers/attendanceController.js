import Attendance from "../models/attendance.js";
import xlsx from "xlsx";

// ✅ Mark attendance
export const markAttendance = async (req, res) => {
  const { studentId, checkIn, checkOut, status } = req.body;
  await Attendance.create({ student: studentId, checkIn, checkOut, status });
  req.flash("success", "Attendance marked successfully!");
  res.redirect("/admin/attendance");
};

// 📊 View all attendance
export const getAttendance = async (req, res) => {
  const records = await Attendance.find().populate("student", "roll hostelName").lean();
  res.render("admin/attendance_dashboard", { title: "Attendance Records", records });
};

// 📤 Export to Excel
export const exportAttendance = async (req, res) => {
  const data = await Attendance.find().populate("student", "roll hostelName").lean();
  const formatted = data.map((r) => ({
    Roll: r.student?.roll || "N/A",
    Hostel: r.student?.hostelName || "N/A",
    Date: new Date(r.date).toLocaleDateString(),
    CheckIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-",
    CheckOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-",
    Status: r.status,
  }));

  const ws = xlsx.utils.json_to_sheet(formatted);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Attendance");
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");
  res.send(buffer);
};
