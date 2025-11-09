import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
    },

    hostelName: {
      type: String,
      required: [true, "Hostel name is required"],
      default: "Main Hostel",
      trim: true,
    },

    capacity: {
      type: Number,
      default: 2,
      min: [1, "Room must have at least one bed"],
    },

    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    isOccupied: {
      type: Boolean,
      default: false,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender type (male/female) is required"],
    },

    batchYear: {
      type: Number, // e.g., 2023, 2024
      required: [true, "Batch year is required"],
    },

    status: {
      type: String,
      enum: ["vacant", "partial", "full"],
      default: "vacant",
    },
  },
  { timestamps: true }
);

//
// 🔹 Virtual field for easy UI usage
//
roomSchema.virtual("remainingCapacity").get(function () {
  return this.capacity - this.occupants.length;
});

//
// 🔹 Middleware: Auto-update isOccupied & status before save
//
roomSchema.pre("save", function (next) {
  const total = this.occupants.length;
  if (total === 0) {
    this.isOccupied = false;
    this.status = "vacant";
  } else if (total < this.capacity) {
    this.isOccupied = false;
    this.status = "partial";
  } else {
    this.isOccupied = true;
    this.status = "full";
  }
  next();
});

//
// 🔹 Indexing for faster smart allotment queries
//
roomSchema.index({ gender: 1, batchYear: 1, isOccupied: 1 });

export default mongoose.model("Room", roomSchema);
