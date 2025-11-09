import mongoose from "mongoose";
const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  roll: String,
  hostelName: String,
  roomNumber: String,
  feeStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  payments: [
    {
      paymentId: String,
      amount: Number,
      method: String,
      status: String,
      date: { type: Date, default: Date.now },
    },
  ],
  profilePic: { type: String },
  phone: String,
  gender: { type: String, enum: ["male", "female"], required: true },
  batchYear: { type: Number, required: true },
  roomNumber: { type: String, default: null },
});
export default mongoose.model("Student", studentSchema);
