import Leave from "../models/leave.js";
import Student from "../models/student.js";

export const getLeaves = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });
    const leaves = await Leave.find({ student: student._id }).sort({
      createdAt: -1,
    });

    res.render("student/leaves", {
      title: "Hostel Leave",
      user: req.session.user,
      leaves,
      success: null,
      error: null,
    });
  } catch (err) {
    console.log("Leave Page Error:", err);
    res.render("student/leaves", {
      title: "Hostel Leave",
      user: req.session.user,
      leaves: [],
      success: null,
      error: "Failed to load leave applications.",
    });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.session.user._id });

    const { reason, fromDate, toDate } = req.body;

    if (!reason || !fromDate || !toDate) {
      return res.render("student/leaves", {
        title: "Hostel Leave",
        user: req.session.user,
        leaves: await Leave.find({ student: student._id }).sort({
          createdAt: -1,
        }),
        success: null,
        error: "All fields are required.",
      });
    }

    await Leave.create({
      student: student._id,
      reason,
      fromDate,
      toDate,
      status: "Pending",
      createdAt: new Date(),
    });

    res.render("student/leaves", {
      title: "Hostel Leave",
      user: req.session.user,
      leaves: await Leave.find({ student: student._id }).sort({
        createdAt: -1,
      }),
      success: "Leave applied successfully!",
      error: null,
    });
  } catch (err) {
    console.log("Apply Leave Error:", err);

    res.render("student/leaves", {
      title: "Hostel Leave",
      user: req.session.user,
      leaves: [],
      success: null,
      error: "Error applying for leave.",
    });
  }
};
