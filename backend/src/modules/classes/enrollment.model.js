const mongoose = require('mongoose');
const { ENROLLMENT_STATUS } = require('../../utils/constants');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: Object.values(ENROLLMENT_STATUS), 
    default: ENROLLMENT_STATUS.ACTIVE 
  },
  removedAt: { type: Date }
}, {
  timestamps: true
});

enrollmentSchema.index({ student: 1, class: 1 });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ class: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
