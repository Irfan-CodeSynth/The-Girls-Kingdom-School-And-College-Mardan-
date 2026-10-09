const mongoose = require('mongoose');

const tuitionSectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionCourse',
      required: [true, 'Course reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Section title is required (e.g. Week 1: Foundations)'],
      trim: true,
      maxlength: 120,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

tuitionSectionSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('TuitionSection', tuitionSectionSchema);
