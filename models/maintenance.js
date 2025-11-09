import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  room: { type: String, required: false, default : "N/A" },
  issue: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

export default mongoose.model("Maintenance", maintenanceSchema);
