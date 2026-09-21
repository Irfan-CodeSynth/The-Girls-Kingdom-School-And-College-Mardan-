const { z } = require('zod');
const { QUIZ_STATUS, QUESTION_TYPES, RESULT_VISIBILITY } = require('../../utils/constants');

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

// ─── Option ────────────────────────────────────────────────
const optionSchema = z.object({
  text: z.string().min(1).max(500),
  isCorrect: z.boolean().default(false)
});

// ─── Individual Question ────────────────────────────────────
const questionSchema = z.discriminatedUnion('type', [
  // MCQ — requires 2+ options with exactly one correct
  z.object({
    type: z.literal(QUESTION_TYPES.MCQ),
    questionText: z.string().min(1).max(2000),
    marks: z.number().min(0.5).default(1),
    options: z.array(optionSchema).min(2).max(6),
    order: z.number().optional()
  }),
  // True/False
  z.object({
    type: z.literal(QUESTION_TYPES.TRUE_FALSE),
    questionText: z.string().min(1).max(2000),
    marks: z.number().min(0.5).default(1),
    correctAnswer: z.enum(['true', 'false']),
    order: z.number().optional()
  }),
  // Comprehensive
  z.object({
    type: z.literal(QUESTION_TYPES.COMPREHENSIVE),
    questionText: z.string().min(1).max(2000),
    marks: z.number().min(0.5).default(1),
    modelAnswer: z.string().max(5000).optional(),
    order: z.number().optional()
  })
]);

// ─── Create Quiz ────────────────────────────────────────────
const createQuizSchema = {
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    classId: mongoId,
    duration: z.number().int().min(1).max(360), // 1 min – 6 hrs
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    passingMarks: z.number().min(0).optional(),
    resultVisibility: z.enum(Object.values(RESULT_VISIBILITY)).optional(),
    allowLateSubmission: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    maxAttempts: z.number().int().min(1).max(10).optional()
  })
};

// ─── Update Quiz (all optional) ─────────────────────────────
const updateQuizSchema = {
  params: z.object({
    id: mongoId
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    duration: z.number().int().min(1).max(360).optional(),
    startTime: z.string().datetime().optional().nullable(),
    endTime: z.string().datetime().optional().nullable(),
    passingMarks: z.number().min(0).optional(),
    resultVisibility: z.enum(Object.values(RESULT_VISIBILITY)).optional(),
    allowLateSubmission: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    maxAttempts: z.number().int().min(1).max(10).optional()
  })
};

// ─── Add / Replace questions ────────────────────────────────
const setQuestionsSchema = {
  params: z.object({
    id: mongoId
  }),
  body: z.object({
    questions: z.array(questionSchema).min(1).max(100)
  })
};

// ─── Publish / Close quiz ───────────────────────────────────
const publishQuizSchema = {
  params: z.object({
    id: mongoId
  })
};

// ─── Answer payload for student submission ──────────────────
const answerSchema = z.object({
  questionId: mongoId,
  selectedOptionId: mongoId.optional(),
  selectedAnswer: z.enum(['true', 'false']).optional(),
  writtenAnswer: z.string().max(8000).optional()
});

// ─── Save progress (partial submit during attempt) ──────────
const saveProgressSchema = {
  params: z.object({
    attemptId: mongoId
  }),
  body: z.object({
    answers: z.array(answerSchema).min(0).max(200)
  })
};

// ─── Final submit ────────────────────────────────────────────
const submitAttemptSchema = {
  params: z.object({
    attemptId: mongoId
  }),
  body: z.object({
    answers: z.array(answerSchema).min(0).max(200).optional()
  }).optional()
};

// ─── Grade comprehensive answer ───────────────────────────────
const gradeAnswerSchema = {
  params: z.object({
    attemptId: mongoId,
    questionId: mongoId
  }),
  body: z.object({
    teacherMarks: z.number().min(0),
    teacherFeedback: z.string().max(1000).optional()
  })
};

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  setQuestionsSchema,
  publishQuizSchema,
  saveProgressSchema,
  submitAttemptSchema,
  gradeAnswerSchema
};
