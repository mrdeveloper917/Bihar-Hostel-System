import Leave from "../models/leave.js";
import Student from "../models/student.js";

// 📄 GET LEAVES PAGE
export const getLeaves = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });
    if (!student) return res.redirect("/login");

    const leaves = await Leave.find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    res.render("student/leaves", {
      title: "My Leave Requests",
      user: req.session.user,
      student,
      leaves,
    });
  } catch (error) {
    console.error("❌ Error loading leaves:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// 🆕 APPLY FOR LEAVE
export const applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    const student = await Student.findOne({ user: req.session.user._id });

    await Leave.create({
      student: student._id,
      studentName: req.session.user.name,
      reason,
      fromDate,
      toDate,
      status: "pending",
    });

    req.flash("success", "Leave request submitted successfully!");
    res.redirect("/student/leaves");
  } catch (error) {
    console.error("❌ Error applying for leave:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// ❌ CANCEL LEAVE
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    if (leave.status !== "pending")
      return res.status(400).json({ error: "Only pending leaves can be canceled" });

    await Leave.findByIdAndDelete(req.params.id);
    req.flash("success", "Leave request canceled!");
    res.redirect("/student/leaves");
  } catch (error) {
    console.error("❌ Error canceling leave:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};
