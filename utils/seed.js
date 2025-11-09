import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Student from "../models/student.js";
import Room from "../models/room.js";
import Booking from "../models/booking.js";
import Complaint from "../models/complaint.js";
import bcrypt from "bcrypt";

dotenv.config();
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bihar_hostel";

async function seed() {
  await mongoose.connect(MONGO);
  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Room.deleteMany(),
    Booking.deleteMany(),
    Complaint.deleteMany(),
  ]);
  const adminPass = await bcrypt.hash("admin123", 10);
  const admin = await User.create({
    name: "Admin",
    email: "admin@bihar.local",
    password: adminPass,
    role: "admin",
  });
  const sPass = await bcrypt.hash("student123", 10);
  const u1 = await User.create({
    name: "Ravi Kumar",
    email: "ravi@bihar.local",
    password: sPass,
    role: "student",
  });
  const stud1 = await Student.create({
    user: u1._id,
    roll: "BHS001",
    hostelName: "Main Hostel",
    roomNumber: "A101",
    feeStatus: "paid",
  });
  const rooms = [];
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      number: "A" + (100 + i),
      hostel: "Main Hostel",
      capacity: 2,
      occupants: [],
      isOccupied: false,
    });
  }
  await Room.insertMany(rooms);
  await Booking.create({
    student: stud1._id,
    studentName: "Ravi Kumar",
    roomNumber: "A101",
    hostelName: "Main Hostel",
    status: "confirmed",
  });
  await Complaint.create({
    student: stud1._id,
    studentName: "Ravi Kumar",
    subject: "Water leak",
    description: "Bathroom leak needs fixing",
    status: "open",
  });
  console.log("Seed done");
  process.exit(0);
}
seed();
