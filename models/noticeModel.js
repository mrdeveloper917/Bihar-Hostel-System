import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: String, default: new Date().toLocaleDateString() },
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);
