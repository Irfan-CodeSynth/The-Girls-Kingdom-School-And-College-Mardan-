const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  teacherId: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true, trim: true }
}, {
  timestamps: true
});


const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
module.exports = TeacherProfile;
