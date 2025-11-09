import fs from "fs";
import path from "path";
import Student from "../models/student.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/login");

    const student = await Student.findOne({ user: user._id }).lean();

    res.render("pages/profile", {
      title: "Profile",
      user,
      student,
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/login");

    const { name, phone } = req.body;

    // ✅ Step 1: Find student
    const student = await Student.findOne({ user: user._id });
    if (!student) {
      req.flash("error", "Student not found!");
      return res.redirect("/student/profile");
    }

    // ✅ Step 2: Handle file upload
    let profilePicPath = student.profilePic; // default old pic

    if (req.file) {
      const uploadsDir = "public/uploads/profiles";

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const oldPath = req.file.path;
      const newPath = path.join(uploadsDir, req.file.filename);

      // Move file from temp folder → profiles folder
      fs.renameSync(oldPath, newPath);

      // Save relative path for DB (accessible from /uploads)
      profilePicPath = `/uploads/profiles/${req.file.filename}`;

      // Delete old image (optional cleanup)
      if (student.profilePic && fs.existsSync("public" + student.profilePic)) {
        fs.unlinkSync("public" + student.profilePic);
      }
    }

    // ✅ Step 3: Update student record
    student.name = name;
    student.phone = phone;
    student.profilePic = profilePicPath;
    await student.save();

    // ✅ Step 4: Update session user pic
    req.session.user.profilePic = profilePicPath;

    req.flash("success", "Profile updated successfully!");
    res.redirect("/student/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Server Error");
  }
};
