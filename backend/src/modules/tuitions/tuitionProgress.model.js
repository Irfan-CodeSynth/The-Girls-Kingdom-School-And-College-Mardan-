const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    selectedOption: { type: mongoose.Schema.Types.ObjectId, default: null },
    textAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    answers: [quizAnswerSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const tuitionProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionCourse',
      required: [true, 'Course is required'],
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionLecture',
      required: [true, 'Lecture is required'],
    },
    // Video progress
    watchTimeSeconds: { type: Number, default: 0 },
    maxWatchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    videoCompleted: { type: Boolean, default: false },
    videoCompletedAt: { type: Date, default: null },
    // Quiz progress
    quizCompleted: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    quizTotalMarks: { type: Number, default: 0 },
    quizPercentage: { type: Number, default: 0 },
    quizSubmittedAt: { type: Date, default: null },
    quizAttempts: [quizAttemptSchema],
    // Derived: true when video done AND (no quiz OR quiz submitted)
    lectureFullyCompleted: { type: Boolean, default: false },
    lectureCompletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tuitionProgressSchema.index({ student: 1, lecture: 1 }, { unique: true });
tuitionProgressSchema.index({ student: 1, course: 1 });
tuitionProgressSchema.index({ course: 1, lectureFullyCompleted: 1 });

module.exports = mongoose.model('TuitionProgress', tuitionProgressSchema);
