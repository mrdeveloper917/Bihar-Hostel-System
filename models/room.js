import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hostelName: { type: String, required: true },
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  isOccupied: { type: Boolean, default: false },

  occupants: {
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    }
  ],
  default: []
}

});

export default mongoose.model("Room", roomSchema);
