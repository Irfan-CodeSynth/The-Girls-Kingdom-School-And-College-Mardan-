const mongoose = require('mongoose');

const tuitionEnrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionCourse',
      required: [true, 'Course is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'EnrolledBy admin is required'],
    },
    enrolledAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'completed', 'suspended'],
      default: 'active',
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tuitionEnrollmentSchema.index({ course: 1, student: 1 }, { unique: true });
tuitionEnrollmentSchema.index({ student: 1, status: 1 });
tuitionEnrollmentSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('TuitionEnrollment', tuitionEnrollmentSchema);
