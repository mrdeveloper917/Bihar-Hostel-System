import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  condition: {
    type: String,
    enum: ["Good", "Under Maintenance", "Damaged"],
    default: "Good",
  },
  room: { type: String }, // e.g. "Room 102"
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Optional
  lastChecked: { type: Date, default: Date.now },
  remarks: { type: String },
  damageCharge: { type: Number, default: 0 },
});

export default mongoose.model("Inventory", inventorySchema);
