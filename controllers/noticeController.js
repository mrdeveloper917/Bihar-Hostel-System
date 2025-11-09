import Notice from "../models/noticeModel.js";

// 📜 STUDENT — VIEW NOTICES
export const getStudentNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();

const formatted = notices.map(n => ({
  ...n,
  content: n.content || n.description || n.message || "No content available",
}));

res.render("student/notices", {
  title: "Hostel Notices",
  user: req.session.user,
  notices: formatted,
});

  } catch (error) {
    console.error("❌ Error loading notices:", error);
    res.status(500).render("pages/error500", { title: "Server Error", error });
  }
};
