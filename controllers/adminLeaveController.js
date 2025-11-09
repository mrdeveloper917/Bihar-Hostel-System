import Leave from "../models/leave.js";
import Student from "../models/student.js";

// 📋 GET ALL LEAVE REQUESTS
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("student", "hostelName roomNumber")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/leaves", {
      title: "Manage Leave Requests",
      user: req.session.user,
      leaves,
    });
  } catch (error) {
    console.error("❌ Error loading leaves for admin:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// ✅ APPROVE LEAVE
export const approveLeave = async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: "approved" });
    req.flash("success", "Leave approved successfully!");
    res.redirect("/admin/leaves");
  } catch (error) {
    console.error("❌ Error approving leave:", error);
    req.flash("error", "Failed to approve leave");
    res.redirect("/admin/leaves");
  }
};

// ❌ REJECT LEAVE
export const rejectLeave = async (req, res) => {
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status: "rejected" });
    req.flash("success", "Leave rejected successfully!");
    res.redirect("/admin/leaves");
  } catch (error) {
    console.error("❌ Error rejecting leave:", error);
    req.flash("error", "Failed to reject leave");
    res.redirect("/admin/leaves");
  }
};
