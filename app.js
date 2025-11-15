// 📦 Imports
import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from "url";


// 🧭 Routes
import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRegisterRoutes from "./routes/adminRegister.js";
import adminNoticeRoutes from "./routes/adminNoticeRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminLeaveRoutes from "./routes/adminLeaveRoutes.js";
import studentNoticeRoutes from "./routes/studentNoticeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";





// 🧩 Config
dotenv.config();
const app = express();
const __dirname = path.resolve();

// =========================
// 🗄️ MongoDB Connection
// =========================
const MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/bihar_hostel";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔁 Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// =========================
// ⚙️ Middlewares
// =========================
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// =========================
// 🧱 EJS Layouts Setup
// =========================
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// =========================
// 🛡️ Helmet Security Config
// =========================
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://code.jquery.com",
          "https://cdn.datatables.net",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.datatables.net",
        ],
        "font-src": [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
        ],
        imgSrc: ["'self'", "data:", "blob:", "https://cdn.jsdelivr.net", "https://images.unsplash.com",
        "https://*.unsplash.com"],
        "connect-src": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const __filename = fileURLToPath(import.meta.url);

// =========================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("trust proxy", 1);


// =========================
// 💾 Sessions & Flash
// =========================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "biharhostelsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,   // << must be true on Render
      sameSite: "none",
      // maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(flash());


// =========================
// 💬 Global Variables (Flash + User)
// =========================
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  const f = req.flash();
  res.locals.flash = {
    message: f.success ? f.success[0] : f.error ? f.error[0] : "",
    type: f.success ? "success" : f.error ? "error" : "",
  };
  res.locals.title = "Bihar Hostel Management System"; // Default title
  next();
});

// =========================
// 🌐 Routes
// =========================
app.use("/", mainRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes); // ✅ Student routes (including /student/profile)

app.use("/admin", adminNoticeRoutes);
app.use("/", leaveRoutes);
app.use("/", adminLeaveRoutes);
app.use("/", studentNoticeRoutes);
app.use("/payment", paymentRoutes);

app.use("/", visitorRoutes);


app.use("/", adminRegisterRoutes);

app.get("/profile", (req, res) => res.redirect("/student/profile"));
app.post("/profile", (req, res) => res.redirect(307, "/student/profile"));



// =========================
// 🚫 404 Page
// =========================
app.use((req, res) => {
  res.status(404).render("pages/error404", { title: "Page Not Found" });
});

// =========================
// 🔥 500 Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).render("pages/error500", {
    title: "Server Error",
    error: err,
  });
});

// =========================
// 🚀 Start Server
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
