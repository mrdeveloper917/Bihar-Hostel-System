import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const router = express.Router();

// ✅ Show admin registration form
router.get("/admin-register", (req, res) => {
  res.render("pages/admin_register", { title: "Admin Registration" });
});

// ✅ Handle admin registration form
router.post("/admin-register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User with this email already exists!");
      return res.redirect("/admin-register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    req.flash("success", "✅ Admin account created successfully! You can now log in.");
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating admin:", error);
    req.flash("error", "Something went wrong while creating admin!");
    res.redirect("/admin-register");
  }
});

export default router;
