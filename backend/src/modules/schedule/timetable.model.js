const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  startTime: {
    type: String,
    required: true,
    trim: true, // e.g. "08:30 AM"
  },
  endTime: {
    type: String,
    required: true,
    trim: true, // e.g. "09:15 AM"
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  room: {
    type: String,
    trim: true,
    default: 'Classroom',
  },
  isBreak: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    lowercase: true,
  },
  periods: [periodSchema],
}, { _id: false });

const timetableSchema = new mongoose.Schema({
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
  days: [dayScheduleSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
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

// Ensure only one active timetable per class per academic year
timetableSchema.index({ class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
