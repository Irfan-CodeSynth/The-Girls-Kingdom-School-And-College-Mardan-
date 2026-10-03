const mongoose = require('mongoose');

const examEntrySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required'],
  },
  day: {
    type: String,
    trim: true,
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true,
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true,
  },
  room: {
    type: String,
    trim: true,
    default: 'Examination Hall',
  },
  invigilator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  passingMarks: {
    type: Number,
    default: 40,
  },
  syllabus: {
    type: String,
    trim: true,
  },
}, { _id: true });

const datesheetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: ['midterm', 'final', 'monthly_test', 'mock_board'],
    default: 'midterm',
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
    default: '2025-2026',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  entries: [examEntrySchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  generalInstructions: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

datesheetSchema.index({ class: 1, examType: 1, academicYear: 1 });
datesheetSchema.index({ status: 1 });

module.exports = mongoose.model('ExamDatesheet', datesheetSchema);
