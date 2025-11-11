import Visitor from "../models/visitor.js";
import Student from "../models/student.js";

/* ============================================================
   🧾 VISITOR MANAGEMENT CONTROLLER
============================================================ */

/* ============================
   🧍 ADD VISITOR (Security Entry)
============================= */
export const addVisitor = async (req, res) => {
  try {
    const { name, contact, studentId, purpose } = req.body;

    if (!name || !studentId || !purpose) {
      req.flash("error", "All fields are required!");
      return res.redirect("/security/visitors");
    }

    await Visitor.create({
      name,
      contact,
      student: studentId,
      purpose,
      status: "Pending",
      inTime: new Date(),
    });

    req.flash("success", "Visitor entry added successfully!");
    res.redirect("/security/visitors");
  } catch (error) {
    console.error("❌ Error adding visitor:", error);
    req.flash("error", "Failed to add visitor entry!");
    res.redirect("/security/visitors");
  }
};

/* ============================
   ✅ APPROVE VISITOR (Admin / Security)
============================= */
export const approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      req.flash("error", "Visitor not found!");
      return res.redirect("back");
    }

    visitor.status = "Approved";
    visitor.approvedBy = req.session.user._id;
    await visitor.save();

    req.flash("success", `Visitor ${visitor.name} approved successfully!`);

    // Redirect based on user role
    const redirectTo =
      req.session.user.role === "admin" ? "/admin" : "/security/visitors";
    res.redirect(redirectTo);
  } catch (error) {
    console.error("❌ Error approving visitor:", error);
    req.flash("error", "Failed to approve visitor!");
    res.redirect("back");
  }
};

/* ============================
   🚪 CHECKOUT VISITOR
============================= */
export const checkoutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      req.flash("error", "Visitor not found!");
      return res.redirect("back");
    }

    visitor.status = "Checked-Out";
    visitor.outTime = new Date();
    await visitor.save();

    req.flash("success", `Visitor ${visitor.name} checked out successfully!`);

    const redirectTo =
      req.session.user.role === "admin" ? "/admin" : "/security/visitors";
    res.redirect(redirectTo);
  } catch (error) {
    console.error("❌ Error checking out visitor:", error);
    req.flash("error", "Failed to check out visitor!");
    res.redirect("back");
  }
};

/* ============================
   👁 VIEW ALL VISITORS (Admin)
============================= */
export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .populate("student", "roll hostelName")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/visitors_dashboard", {
      title: "Visitor Logs",
      user: req.session.user,
      visitors,
    });
  } catch (error) {
    console.error("🔥 Error loading visitors:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

/* ============================
   👁 VIEW VISITORS (Security Staff)
============================= */
export const getSecurityVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .populate("student", "roll hostelName")
      .sort({ createdAt: -1 })
      .lean();

    const students = await Student.find().select("roll hostelName").lean();

    res.render("security/visitors", {
      title: "Security Visitor Log",
      user: req.session.user,
      visitors,
      students,
    });
  } catch (error) {
    console.error("🔥 Error loading security visitors:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};
