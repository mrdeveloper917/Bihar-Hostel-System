
import mongoose from 'mongoose';
const complaintSchema = new mongoose.Schema({
  student:{type: mongoose.Schema.Types.ObjectId, ref:'Student'},
  studentName:String,
  subject:String,
  description:String,
  attachment:String,
  status:{type:String, enum:['open','inprogress','closed'], default:'open'},
  createdAt:{type:Date, default:Date.now}
});
export default mongoose.model('Complaint', complaintSchema);
