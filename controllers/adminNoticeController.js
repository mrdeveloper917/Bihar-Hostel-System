import Notice from "../models/noticeModel.js";

// 📋 GET ALL NOTICES
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();

    res.render("admin/notices", {
      title: "Manage Notices",
      user: req.session.user,
      notices,
    });
  } catch (error) {
    console.error("❌ Error fetching notices:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// 🆕 ADD NEW NOTICE
export const postNotice = async (req, res) => {
  try {
    const { title, description } = req.body;

    await Notice.create({
      title,
      description,
      postedBy: req.session.user?.name || "Admin",
    });

    req.flash("success", "Notice added successfully!");
    res.redirect("/admin/notices");
  } catch (error) {
    console.error("❌ Error adding notice:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// ✏️ EDIT NOTICE
export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    await Notice.findByIdAndUpdate(id, { title, description });
    req.flash("success", "Notice updated successfully!");
    res.redirect("/admin/notices");
  } catch (error) {
    console.error("❌ Error updating notice:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};

// 🗑️ DELETE NOTICE
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await Notice.findByIdAndDelete(id);

    req.flash("success", "Notice deleted successfully!");
    res.redirect("/admin/notices");
  } catch (error) {
    console.error("❌ Error deleting notice:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};
