
import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  student:{type: mongoose.Schema.Types.ObjectId, ref:'Student'},
  studentName:String,
  roomNumber:String,
  hostelName:String,
  status:{type:String, enum:['pending','confirmed','rejected'], default:'pending'},
  createdAt:{type:Date, default:Date.now}
});
export default mongoose.model('Booking', bookingSchema);
