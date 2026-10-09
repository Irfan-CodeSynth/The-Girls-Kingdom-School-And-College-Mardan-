const mongoose = require('mongoose');

const tuitionCourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 150,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned instructor is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade/Class level is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isEnrollmentOpen: {
      type: Boolean,
      default: true,
    },
    totalLecturesCount: {
      type: Number,
      default: 0,
    },
    totalDurationMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tuitionCourseSchema.index({ status: 1, instructor: 1 });
tuitionCourseSchema.index({ subject: 1, gradeLevel: 1 });

module.exports = mongoose.model('TuitionCourse', tuitionCourseSchema);
