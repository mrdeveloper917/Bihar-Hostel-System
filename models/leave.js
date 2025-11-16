// models/leave.js
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  reason: { type: String, required: true, trim: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  adminComment: { type: String },
});

leaveSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Leave", leaveSchema);
