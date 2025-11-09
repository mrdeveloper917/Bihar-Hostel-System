
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name:String,
  email:{type:String, required:true, unique:true},
  password:String,
  role:{type:String, enum:['admin','student'], default:'student'},
  phone:String,
  profilePic:String,
  createdAt:{type:Date, default:Date.now}
});
export default mongoose.model('User', userSchema);
