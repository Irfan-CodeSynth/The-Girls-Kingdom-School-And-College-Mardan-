const mongoose = require('mongoose');
const { ATTEMPT_STATUS } = require('../../utils/constants');

/**
 * Answer sub-schema — one per question in the quiz
 */
const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    // MCQ / True-False: store selected option id or 'true'/'false'
    selectedOption: { type: mongoose.Schema.Types.ObjectId },
    selectedAnswer: { type: String }, // 'true' | 'false'
    // Comprehensive: student's written response
    writtenAnswer: { type: String, trim: true, maxlength: 8000 },

    // Auto-grading result (set on submission for MCQ/TF)
    isCorrect: { type: Boolean },
    marksObtained: { type: Number, default: 0 },

    // Manual grading (set by teacher for comprehensive)
    teacherMarks: { type: Number },
    teacherFeedback: { type: String, trim: true, maxlength: 1000 }
  },
  { _id: true }
);

/**
 * Attempt schema — tracks a student's quiz attempt
 */
const attemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },

    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATUS),
      default: ATTEMPT_STATUS.IN_PROGRESS
    },

    answers: [answerSchema],

    // Timing
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    expiresAt: { type: Date }, // startedAt + quiz.duration

    // Scores (filled on submission / after grading)
    totalMarks: { type: Number, default: 0 },       // quiz.totalMarks snapshot
    obtainedMarks: { type: Number, default: 0 },    // auto + manual
    autoGradedMarks: { type: Number, default: 0 },  // MCQ + TF only
    manualGradedMarks: { type: Number, default: 0 },// comprehensive

    percentage: { type: Number, default: 0 },
    isPassed: { type: Boolean },

    // Flag tracking
    attemptNumber: { type: Number, default: 1 }
  },
  { timestamps: true }
);

// Unique attempt per student-quiz-attempt number
attemptSchema.index({ quiz: 1, student: 1, attemptNumber: 1 }, { unique: true });
attemptSchema.index({ student: 1, status: 1 });
attemptSchema.index({ quiz: 1, status: 1 });
attemptSchema.index({ class: 1 });

const Attempt = mongoose.model('Attempt', attemptSchema);
module.exports = Attempt;
