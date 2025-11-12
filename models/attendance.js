import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  date: { type: Date, default: Date.now },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" },
});

export default mongoose.model("Attendance", attendanceSchema);
