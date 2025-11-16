import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String },
  status: { type: String },
  date: { type: Date, default: Date.now },
});

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  roll: String,
  hostelName: String,
  roomNumber: { type: String, default: null },

  feeStatus: {
    type: String,
    enum: ["Paid", "Partial", "Unpaid"],
    default: "Unpaid",
  },

  totalFeesPaid: { type: Number, default: 0 },

  payments: [paymentSchema],

  profilePic: String,
  phone: String,
  gender: { type: String, enum: ["male", "female"], required: true },
  batchYear: { type: Number, required: true },

  lastPaymentDate: { type: Date },
});

export default mongoose.model("Student", studentSchema);
