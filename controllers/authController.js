import User from "../models/user.js";
import Student from "../models/student.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// =============================
// 🧭 GET: Login Page
// =============================
export const getLogin = (req, res) => {
  res.render("auth/login", { title: "Login" });
};

// =============================
// 🧾 GET: Register Page
// =============================
export const getRegister = (req, res) => {
  res.render("auth/register", { title: "Register" });
};

// =============================
// 📝 POST: Register User
// =============================
export const postRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      );
      return res.redirect("/register");
    }

    const { name, email, password, password2, phone, gender, batchYear, role } =
      req.body;

    // ✅ Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !password2 ||
      !gender ||
      !batchYear ||
      !role
    ) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }

    if (password !== password2) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }

    if (password.trim().length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/register");
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already exists with this email.");
      return res.redirect("/register");
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create User
    const newUser = await User.create({
      name,
      email,
      phone,
      gender,
      batchYear,
      password: hashedPassword,
      role: role || "student", // default role: student
    });

    // ✅ If student, create student profile
    if (role === "student") {
      await Student.create({
        user: newUser._id,
        gender,
        batchYear,
        hostelName: "",
        roomNumber: "",
        feeStatus: "Unpaid",
      });
    }

    req.flash("success", "🎉 Account created successfully! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error("❌ Register error:", error.message);
    req.flash("error", "Something went wrong during registration.");
    res.redirect("/register");
  }
};

// =============================
// 🔐 POST: Login User
// =============================
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/login");
    }

    // ✅ Save session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // ✅ Redirect by role
    if (user.role === "admin") {
      req.flash("success", "Welcome Admin!");
      return res.redirect("/admin");
    } else if (user.role === "student") {
      req.flash("success", `Welcome ${user.name}!`);
      return res.redirect("/student");
    } else {
      req.flash("error", "Unauthorized role detected.");
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    req.flash("error", "Login failed due to a server issue.");
    res.redirect("/login");
  }
};

// =============================
// 🚪 LOGOUT
// =============================
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
