const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'image', 'png', 'jpg', 'jpeg', 'other'], default: 'pdf' },
    fileSize: { type: Number, default: 0 },
  },
  { _id: true }
);

const quizOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
    options: [quizOptionSchema],
    marks: { type: Number, default: 1, min: 1 },
    explanation: { type: String, default: '', trim: true },
  },
  { _id: true }
);

const tuitionLectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionCourse',
      required: [true, 'Course reference is required'],
      index: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TuitionSection',
      required: [true, 'Section reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, default: '', trim: true },
    order: { type: Number, required: true, min: 1 },
    video: {
      provider: { type: String, enum: ['youtube', 'cloudflare', 'vimeo'], default: 'youtube' },
      videoId: { type: String, trim: true, default: '' },
      durationSeconds: { type: Number, default: 0 },
      minWatchPercentage: { type: Number, default: 90, min: 1, max: 100 },
    },
    notes: [noteSchema],
    quiz: {
      title: { type: String, trim: true, default: '' },
      questions: [quizQuestionSchema],
    },
    hasQuiz: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tuitionLectureSchema.index({ course: 1, order: 1 });
tuitionLectureSchema.index({ course: 1, section: 1, order: 1 });

module.exports = mongoose.model('TuitionLecture', tuitionLectureSchema);
