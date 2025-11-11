import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    inTime: {
      type: Date,
      default: Date.now,
    },
    outTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Checked-Out"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    inTime: { type: Date, default: Date.now },
    outTime: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);
