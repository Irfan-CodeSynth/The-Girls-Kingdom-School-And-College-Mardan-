const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../../utils/constants');

const attendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
      required: true,
    },
    remarks: {
      type: String,
      maxlength: 250,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one record per student per class on any given date
attendanceSchema.index({ class: 1, student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, status: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

module.exports = {
  Attendance,
  ATTENDANCE_STATUS,
};
