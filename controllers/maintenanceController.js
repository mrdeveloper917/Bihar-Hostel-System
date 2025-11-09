import Maintenance from "../models/maintenance.js";
import Student from "../models/student.js";

/* 🧾 STUDENT: View Maintenance Requests */
export const getMaintenanceRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id }).lean();
    const requests = await Maintenance.find({ student: student._id }).sort({ createdAt: -1 }).lean();

    res.render("student/maintenance", {
      title: "Maintenance Requests",
      user: req.session.user,
      requests,
    });
  } catch (error) {
    console.error("❌ Error loading maintenance requests:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* 🧰 STUDENT: Submit a New Request */
export const postMaintenanceRequest = async (req, res) => {
  try {
    const { issue, room } = req.body;
    const userId = req.session.user._id;
    const student = await Student.findOne({ user: userId });

    // ✅ auto-fill room if not provided
    const roomValue = room && room.trim() !== "" ? room : student.roomNumber;

    if (!issue) {
      req.flash("error", "Issue description is required!");
      return res.redirect("/student/maintenance");
    }

    await Maintenance.create({
      student: student._id,
      issue,
      room: roomValue || "Unknown",
      status: "Pending",
    });

    req.flash("success", "Maintenance request submitted successfully!");
    res.redirect("/student/maintenance");
  } catch (error) {
    console.error("❌ Error submitting maintenance request:", error);
    req.flash("error", "Failed to submit maintenance request!");
    res.redirect("/student/maintenance");
  }
};


/* 🧹 ADMIN: View All Requests */
export const getAllMaintenance = async (req, res) => {
  try {
    const requests = await Maintenance.find().populate("student").sort({ createdAt: -1 }).lean();

    res.render("admin/maintenance_dashboard", {
      title: "Maintenance Requests",
      user: req.session.user,
      requests,
    });
  } catch (error) {
    console.error("❌ Error loading all maintenance requests:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* 🧾 ADMIN: Update Status */
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) return res.status(404).json({ error: "Request not found" });

    maintenance.status = status;
    if (status === "Resolved") maintenance.resolvedAt = new Date();

    await maintenance.save();

    req.flash("success", `Maintenance request marked as ${status}`);
    res.redirect("/admin/maintenance");
  } catch (error) {
    console.error("❌ Error updating maintenance status:", error);
    req.flash("error", "Failed to update maintenance status");
    res.redirect("/admin/maintenance");
  }
};
