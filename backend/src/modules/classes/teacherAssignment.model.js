const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'removed'], default: 'active' }
}, {
  timestamps: true
});

teacherAssignmentSchema.index({ teacher: 1, class: 1 });
teacherAssignmentSchema.index({ teacher: 1, status: 1 });
teacherAssignmentSchema.index({ class: 1, status: 1 });

const TeacherAssignment = mongoose.model('TeacherAssignment', teacherAssignmentSchema);
module.exports = TeacherAssignment;
