const mongoose = require('mongoose');
const { QUIZ_STATUS, QUESTION_TYPES, RESULT_VISIBILITY } = require('../../utils/constants');

/**
 * Option sub-schema for MCQ questions
 */
const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false }
  },
  { _id: true }
);

/**
 * Question sub-schema — embedded directly inside the Quiz document.
 * Supports three types: MCQ, True/False, and Comprehensive (written).
 */
const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      required: true
    },
    marks: { type: Number, required: true, min: 0.5, default: 1 },
    options: [optionSchema],       // only for mcq / true_false
    correctAnswer: { type: String }, // for true_false: 'true' | 'false'
    modelAnswer: { type: String, trim: true }, // for comprehensive (teacher's reference)
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

/**
 * Quiz schema
 */
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    questions: [questionSchema],

    // Timing
    duration: { type: Number, required: true, min: 1 }, // minutes
    startTime: { type: Date },
    endTime: { type: Date },

    // Grading
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    resultVisibility: {
      type: String,
      enum: Object.values(RESULT_VISIBILITY),
      default: RESULT_VISIBILITY.IMMEDIATELY
    },

    // Access control
    status: {
      type: String,
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.DRAFT
    },
    allowLateSubmission: { type: Boolean, default: false },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },

    // Attempt control
    maxAttempts: { type: Number, default: 1, min: 1 },

    publishedAt: { type: Date },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

// Keep totalMarks in sync when questions change
quizSchema.pre('save', function (next) {
  if (this.isModified('questions')) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }
  next();
});

// Indexes
quizSchema.index({ class: 1, status: 1 });
quizSchema.index({ teacher: 1, status: 1 });
quizSchema.index({ status: 1, startTime: 1, endTime: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
