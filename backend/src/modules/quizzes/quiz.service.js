const Quiz = require('./quiz.model');
const Attempt = require('./attempt.model');
const TeacherAssignment = require('../classes/teacherAssignment.model');
const Enrollment = require('../classes/enrollment.model');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');
const {
  QUIZ_STATUS,
  QUESTION_TYPES,
  ATTEMPT_STATUS,
  ROLES,
  ENROLLMENT_STATUS
} = require('../../utils/constants');

// ─────────────────────────────────────────────────────────────
//  QUIZ CRUD (Teacher / Admin)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new quiz (draft). Teacher must be assigned to the class.
 */
const createQuiz = async (data, userId, userRole) => {
  const { classId, ...rest } = data;

  // Admin can create for any class; teacher only for assigned classes
  if (userRole === ROLES.TEACHER) {
    const assignment = await TeacherAssignment.findOne({
      teacher: userId,
      class: classId,
      status: 'active'
    });
    if (!assignment) {
      throw ApiError.forbidden('You are not assigned to this class.');
    }
  }

  const quiz = await Quiz.create({
    ...rest,
    class: classId,
    teacher: userId,
    status: QUIZ_STATUS.DRAFT,
    questions: []
  });

  return quiz;
};

/**
 * List quizzes — admin sees all, teacher sees their own, student sees published quizzes for their class.
 */
const getQuizzes = async (query, userId, userRole) => {
  const {
    status,
    classId,
    page = 1,
    limit = 20,
    search
  } = query;

  const filter = {};

  if (userRole === ROLES.TEACHER) {
    filter.teacher = userId;
  } else if (userRole === ROLES.STUDENT) {
    // Find student's active enrollment
    const enrollment = await Enrollment.findOne({
      student: userId,
      status: ENROLLMENT_STATUS.ACTIVE
    });
    if (!enrollment) return { quizzes: [], pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 } };
    filter.class = enrollment.class;
    filter.status = QUIZ_STATUS.PUBLISHED;
  }

  if (status && userRole !== ROLES.STUDENT) filter.status = status;
  if (classId && userRole === ROLES.ADMIN) filter.class = classId;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .select('-questions') // don't send full question list in list view
      .populate('class', 'name code')
      .populate('teacher', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Quiz.countDocuments(filter)
  ]);

  // Attach attempt count for teacher/admin view, or student's own attempts
  let quizzesWithMeta = quizzes.map(q => q.toObject());
  if (userRole !== ROLES.STUDENT) {
    const quizIds = quizzes.map(q => q._id);
    const attemptCounts = await Attempt.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $group: { _id: '$quiz', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(attemptCounts.map(a => [a._id.toString(), a.count]));
    quizzesWithMeta = quizzesWithMeta.map(q => ({
      ...q,
      attemptCount: countMap[q._id.toString()] || 0
    }));
  } else {
    const quizIds = quizzes.map(q => q._id);
    const myAttempts = await Attempt.find({
      quiz: { $in: quizIds },
      student: userId
    }).select('quiz status percentage obtainedMarks totalMarks isPassed attemptNumber startedAt submittedAt expiresAt');

    const attemptMap = {};
    myAttempts.forEach(a => {
      const qid = a.quiz.toString();
      if (!attemptMap[qid]) attemptMap[qid] = [];
      attemptMap[qid].push(a);
    });

    quizzesWithMeta = quizzesWithMeta.map(q => ({
      ...q,
      myAttempts: attemptMap[q._id.toString()] || []
    }));
  }

  return {
    quizzes: quizzesWithMeta,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};

/**
 * Get single quiz. Students only see published quizzes. Questions included.
 */
const getQuizById = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId)
    .populate('class', 'name code academicYear')
    .populate('teacher', 'fullName email');

  if (!quiz) throw ApiError.notFound('Quiz not found.');

  // Role checks
  if (userRole === ROLES.STUDENT) {
    if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
      throw ApiError.forbidden('This quiz is not available.');
    }
    const enrollment = await Enrollment.findOne({
      student: userId,
      class: quiz.class._id,
      status: ENROLLMENT_STATUS.ACTIVE
    });
    if (!enrollment) throw ApiError.forbidden('You are not enrolled in this class.');

    // Strip correct answers from student view
    const sanitizedQuiz = quiz.toObject();
    sanitizedQuiz.questions = sanitizedQuiz.questions.map(q => {
      const q2 = { ...q };
      if (q.type === QUESTION_TYPES.MCQ) {
        q2.options = q.options.map(o => ({ _id: o._id, text: o.text }));
      }
      delete q2.correctAnswer;
      delete q2.modelAnswer;
      return q2;
    });
    return { quiz: sanitizedQuiz };
  }

  if (userRole === ROLES.TEACHER) {
    if (String(quiz.teacher._id) !== String(userId)) {
      throw ApiError.forbidden('You can only view your own quizzes.');
    }
  }

  return { quiz: quiz.toObject() };
};

/**
 * Update quiz metadata (not questions — use setQuestions for that).
 */
const updateQuiz = async (quizId, data, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only edit your own quizzes.');
  }
  if (quiz.status === QUIZ_STATUS.PUBLISHED || quiz.status === QUIZ_STATUS.CLOSED) {
    throw ApiError.badRequest('Cannot edit a published or closed quiz. Archive it first.');
  }

  Object.assign(quiz, data);
  await quiz.save();
  return { quiz };
};

/**
 * Replace the full questions array (only in draft).
 */
const setQuestions = async (quizId, questions, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only edit your own quizzes.');
  }
  if (quiz.status !== QUIZ_STATUS.DRAFT) {
    throw ApiError.badRequest('Questions can only be changed while quiz is in Draft status.');
  }

  // Validate MCQ has exactly one correct option
  for (const q of questions) {
    if (q.type === QUESTION_TYPES.MCQ) {
      const correctCount = (q.options || []).filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        throw ApiError.badRequest(`MCQ question "${q.questionText.slice(0, 50)}..." must have exactly one correct option.`);
      }
    }
  }

  quiz.questions = questions.map((q, i) => ({ ...q, order: q.order ?? i }));
  await quiz.save();
  return { quiz };
};

/**
 * Publish quiz — validate minimum requirements, then flip status.
 */
const publishQuiz = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only publish your own quizzes.');
  }
  if (quiz.status !== QUIZ_STATUS.DRAFT) {
    throw ApiError.badRequest(`Quiz is already ${quiz.status}. Only drafts can be published.`);
  }
  if (quiz.questions.length === 0) {
    throw ApiError.badRequest('Cannot publish a quiz with no questions.');
  }
  if (quiz.totalMarks === 0) {
    throw ApiError.badRequest('Total marks must be greater than 0 before publishing.');
  }

  quiz.status = QUIZ_STATUS.PUBLISHED;
  quiz.publishedAt = new Date();
  await quiz.save();

  // Fire-and-forget: notify all enrolled students
  setImmediate(async () => {
    try {
      const enrollments = await Enrollment.find({
        class: quiz.class,
        status: ENROLLMENT_STATUS.ACTIVE
      }).select('student');
      const studentIds = enrollments.map(e => e.student);
      const populatedQuiz = await Quiz.findById(quiz._id).populate('class', 'name');
      await notificationService.notifyQuizPublished(populatedQuiz, studentIds);
    } catch (e) {
      console.error('[Notifications] publishQuiz hook error:', e.message);
    }
  });

  return { quiz };
};

/**
 * Close a published quiz.
 */
const closeQuiz = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only close your own quizzes.');
  }
  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    throw ApiError.badRequest('Only published quizzes can be closed.');
  }

  quiz.status = QUIZ_STATUS.CLOSED;
  quiz.closedAt = new Date();
  await quiz.save();
  return { quiz };
};

/**
 * Archive a draft/closed quiz.
 */
const archiveQuiz = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only archive your own quizzes.');
  }
  if (quiz.status === QUIZ_STATUS.ARCHIVED) {
    throw ApiError.badRequest('Quiz is already archived.');
  }
  if (quiz.status === QUIZ_STATUS.PUBLISHED) {
    throw ApiError.badRequest('Close the quiz before archiving it.');
  }

  quiz.status = QUIZ_STATUS.ARCHIVED;
  await quiz.save();
  return { quiz };
};

/**
 * Delete a draft quiz permanently.
 */
const deleteQuiz = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only delete your own quizzes.');
  }
  if (quiz.status !== QUIZ_STATUS.DRAFT && quiz.status !== QUIZ_STATUS.ARCHIVED) {
    throw ApiError.badRequest('Only draft or archived quizzes can be deleted.');
  }

  await Attempt.deleteMany({ quiz: quizId });
  await quiz.deleteOne();
  return { deleted: true };
};

// ─────────────────────────────────────────────────────────────
//  ATTEMPT FLOW (Student)
// ─────────────────────────────────────────────────────────────

/**
 * Start a new attempt. Creates an Attempt document.
 */
const startAttempt = async (quizId, studentId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    throw ApiError.badRequest('This quiz is not available.');
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    class: quiz.class,
    status: ENROLLMENT_STATUS.ACTIVE
  });
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this class.');

  // Check if quiz window is still open
  const now = new Date();
  if (quiz.endTime && now > quiz.endTime) {
    if (!quiz.allowLateSubmission) {
      throw ApiError.badRequest('Quiz submission window has closed.');
    }
  }
  if (quiz.startTime && now < quiz.startTime) {
    throw ApiError.badRequest('Quiz has not started yet.');
  }

  // 1. Check for active in-progress attempt FIRST (allows seamless resumption)
  const inProgress = await Attempt.findOne({
    quiz: quizId,
    student: studentId,
    status: ATTEMPT_STATUS.IN_PROGRESS
  });
  if (inProgress) {
    // If time has expired while away, finalize/auto-submit
    if (inProgress.expiresAt && now > inProgress.expiresAt) {
      const finalized = await autoSubmitAttempt(inProgress);
      throw ApiError.badRequest('Your quiz time expired and your attempt was automatically submitted.');
    }
    return { attempt: inProgress, quiz, resumed: true };
  }

  // 2. Check attempt limit for finished attempts
  const completedAttempts = await Attempt.countDocuments({
    quiz: quizId,
    student: studentId,
    status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.GRADED, ATTEMPT_STATUS.PENDING_REVIEW, ATTEMPT_STATUS.EXPIRED] }
  });
  if (completedAttempts >= quiz.maxAttempts) {
    throw ApiError.badRequest(`Maximum attempts (${quiz.maxAttempts}) reached for this quiz.`);
  }

  const expiresAt = new Date(Date.now() + quiz.duration * 60 * 1000);

  const attempt = await Attempt.create({
    quiz: quizId,
    student: studentId,
    class: quiz.class,
    status: ATTEMPT_STATUS.IN_PROGRESS,
    startedAt: new Date(),
    expiresAt,
    totalMarks: quiz.totalMarks,
    attemptNumber: completedAttempts + 1,
    answers: []
  });

  return { attempt, quiz, resumed: false };
};

/**
 * Save answers mid-attempt (auto-save).
 */
const saveProgress = async (attemptId, studentId, answers) => {
  const attempt = await Attempt.findById(attemptId).populate('quiz');
  if (!attempt) throw ApiError.notFound('Attempt not found.');
  if (String(attempt.student) !== String(studentId)) {
    throw ApiError.forbidden('This is not your attempt.');
  }
  if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
    throw ApiError.badRequest('Attempt is already submitted or expired.');
  }

  // Check timer
  if (attempt.expiresAt && new Date() > attempt.expiresAt) {
    return autoSubmitAttempt(attempt);
  }

  // Merge answers (replace by questionId)
  const answerMap = new Map(attempt.answers.map(a => [a.question.toString(), a]));
  for (const ans of answers) {
    answerMap.set(ans.questionId, {
      question: ans.questionId,
      selectedOption: ans.selectedOptionId || null,
      selectedAnswer: ans.selectedAnswer || null,
      writtenAnswer: ans.writtenAnswer || null
    });
  }
  attempt.answers = Array.from(answerMap.values());
  await attempt.save();

  return { attempt, saved: true };
};

/**
 * Final submission — grades MCQ/TF automatically.
 */
const submitAttempt = async (attemptId, studentId, answers) => {
  const attempt = await Attempt.findById(attemptId).populate('quiz');
  if (!attempt) throw ApiError.notFound('Attempt not found.');
  if (String(attempt.student) !== String(studentId)) {
    throw ApiError.forbidden('This is not your attempt.');
  }
  if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
    throw ApiError.badRequest('Attempt is already submitted.');
  }

  return gradeAndSubmit(attempt, answers);
};

/**
 * Auto-submit when timer expires.
 */
const autoSubmitAttempt = async (attempt) => {
  return gradeAndSubmit(attempt, attempt.answers);
};

/**
 * Internal: grade + finalize an attempt.
 */
const gradeAndSubmit = async (attempt, incomingAnswers) => {
  const quiz = attempt.quiz;

  // Build question lookup
  const questionMap = new Map(quiz.questions.map(q => [q._id.toString(), q]));

  // Merge fresh answers over saved ones
  const answerMap = new Map(attempt.answers.map(a => [a.question.toString(), a]));
  for (const ans of (incomingAnswers || [])) {
    const qId = (ans.questionId || ans.question || '').toString();
    if (qId) {
      answerMap.set(qId, {
        question: qId,
        selectedOption: ans.selectedOptionId || ans.selectedOption || null,
        selectedAnswer: ans.selectedAnswer || null,
        writtenAnswer: ans.writtenAnswer || null
      });
    }
  }

  let autoGradedMarks = 0;
  let hasComprehensive = false;

  const gradedAnswers = quiz.questions.map(q => {
    const qId = q._id.toString();
    const ans = answerMap.get(qId) || {};
    const result = {
      question: q._id,
      selectedOption: ans.selectedOption || null,
      selectedAnswer: ans.selectedAnswer || null,
      writtenAnswer: ans.writtenAnswer || null,
      isCorrect: null,
      marksObtained: 0,
      teacherMarks: null,
      teacherFeedback: null
    };

    if (q.type === QUESTION_TYPES.MCQ) {
      if (ans.selectedOption) {
        const chosenOption = q.options.find(o => o._id.toString() === ans.selectedOption.toString());
        if (chosenOption?.isCorrect) {
          result.isCorrect = true;
          result.marksObtained = q.marks;
          autoGradedMarks += q.marks;
        } else {
          result.isCorrect = false;
        }
      } else {
        result.isCorrect = false;
      }
    } else if (q.type === QUESTION_TYPES.TRUE_FALSE) {
      if (ans.selectedAnswer) {
        result.isCorrect = ans.selectedAnswer === q.correctAnswer;
        if (result.isCorrect) {
          result.marksObtained = q.marks;
          autoGradedMarks += q.marks;
        }
      } else {
        result.isCorrect = false;
      }
    } else if (q.type === QUESTION_TYPES.COMPREHENSIVE) {
      hasComprehensive = true;
      result.isCorrect = null; // teacher grades
    }

    return result;
  });

  attempt.answers = gradedAnswers;
  attempt.autoGradedMarks = autoGradedMarks;
  attempt.obtainedMarks = autoGradedMarks; // manual will be added later
  attempt.percentage = quiz.totalMarks > 0
    ? Math.round((autoGradedMarks / quiz.totalMarks) * 100 * 10) / 10
    : 0;

  if (!hasComprehensive) {
    attempt.isPassed = quiz.passingMarks > 0
      ? autoGradedMarks >= quiz.passingMarks
      : null;
    attempt.status = ATTEMPT_STATUS.GRADED;
  } else {
    attempt.status = ATTEMPT_STATUS.PENDING_REVIEW;
  }

  attempt.submittedAt = new Date();
  await attempt.save();

  // Fire-and-forget notifications
  setImmediate(async () => {
    try {
      const populated = await attempt.populate('quiz');
      if (attempt.status === ATTEMPT_STATUS.GRADED) {
        await notificationService.notifyQuizGraded(populated);
      } else {
        await notificationService.notifyQuizSubmitted(populated);
      }
    } catch (e) {
      console.error('[Notifications] submit hook error:', e.message);
    }
  });

  return { attempt };
};

/**
 * Teacher grades a single comprehensive answer.
 */
const gradeAnswer = async (attemptId, questionId, teacherMarks, teacherFeedback, teacherId) => {
  const attempt = await Attempt.findById(attemptId).populate('quiz');
  if (!attempt) throw ApiError.notFound('Attempt not found.');

  // Verify teacher owns this quiz
  if (String(attempt.quiz.teacher) !== String(teacherId)) {
    throw ApiError.forbidden('You can only grade quizzes you created.');
  }
  if (
    attempt.status !== ATTEMPT_STATUS.PENDING_REVIEW &&
    attempt.status !== ATTEMPT_STATUS.SUBMITTED
  ) {
    throw ApiError.badRequest('This attempt is not pending review.');
  }

  const question = attempt.quiz.questions.find(q => q._id.toString() === questionId);
  if (!question) throw ApiError.notFound('Question not found in quiz.');
  if (question.type !== QUESTION_TYPES.COMPREHENSIVE) {
    throw ApiError.badRequest('Only comprehensive questions require manual grading.');
  }
  if (teacherMarks > question.marks) {
    throw ApiError.badRequest(`Marks cannot exceed question max marks (${question.marks}).`);
  }

  const answerIndex = attempt.answers.findIndex(a => a.question.toString() === questionId);
  if (answerIndex === -1) throw ApiError.notFound('Answer record not found.');

  const prevTeacherMarks = attempt.answers[answerIndex].teacherMarks || 0;
  attempt.answers[answerIndex].teacherMarks = teacherMarks;
  attempt.answers[answerIndex].teacherFeedback = teacherFeedback || '';
  attempt.answers[answerIndex].marksObtained = teacherMarks;

  // Update totals
  attempt.manualGradedMarks = (attempt.manualGradedMarks || 0) - prevTeacherMarks + teacherMarks;
  attempt.obtainedMarks = attempt.autoGradedMarks + attempt.manualGradedMarks;
  attempt.percentage = attempt.totalMarks > 0
    ? Math.round((attempt.obtainedMarks / attempt.totalMarks) * 100 * 10) / 10
    : 0;

  // Check if all comprehensive answers are graded
  const allGraded = attempt.answers.every(a => {
    const q = attempt.quiz.questions.find(q2 => q2._id.toString() === a.question.toString());
    if (!q || q.type !== QUESTION_TYPES.COMPREHENSIVE) return true;
    return a.teacherMarks !== null && a.teacherMarks !== undefined;
  });

  if (allGraded) {
    attempt.isPassed = attempt.quiz.passingMarks > 0
      ? attempt.obtainedMarks >= attempt.quiz.passingMarks
      : null;
    attempt.status = ATTEMPT_STATUS.GRADED;
  }

  await attempt.save();

  // If attempt is now fully graded, notify the student
  if (allGraded) {
    setImmediate(async () => {
      try {
        await notificationService.notifyQuizGraded({
          _id: attempt._id,
          student: attempt.student,
          quiz: attempt.quiz,
          obtainedMarks: attempt.obtainedMarks,
          totalMarks: attempt.totalMarks,
          percentage: attempt.percentage
        });
      } catch (e) {
        console.error('[Notifications] gradeAnswer hook error:', e.message);
      }
    });
  }

  return { attempt };
};

/**
 * Get all of the current student's attempts across all quizzes.
 * Used for the Grades & Transcripts page.
 */
const getMyGrades = async (studentId) => {
  const attempts = await Attempt.find({
    student: studentId,
    status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.GRADED] }
  })
    .populate({
      path: 'quiz',
      select: 'title totalMarks passingMarks duration class teacher',
      populate: [
        { path: 'class', select: 'name code academicYear' },
        { path: 'teacher', select: 'fullName email' }
      ]
    })
    .sort({ submittedAt: -1 });

  // Summary stats
  const graded = attempts.filter(a => a.status === ATTEMPT_STATUS.GRADED);
  const totalAttempts = attempts.length;
  const totalGraded = graded.length;
  const avgPercentage = totalGraded > 0
    ? Math.round(graded.reduce((s, a) => s + (a.percentage || 0), 0) / totalGraded)
    : null;
  const highestScore = totalGraded > 0
    ? Math.max(...graded.map(a => a.percentage || 0))
    : null;
  const passedCount = graded.filter(a => a.isPassed === true).length;

  return {
    attempts,
    summary: {
      totalAttempts,
      totalGraded,
      avgPercentage,
      highestScore,
      passedCount
    }
  };
};

/**
 * Get all attempts for a quiz (teacher/admin).
 */
const getQuizAttempts = async (quizId, userId, userRole) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  if (userRole === ROLES.TEACHER && String(quiz.teacher) !== String(userId)) {
    throw ApiError.forbidden('You can only view attempts for your own quizzes.');
  }

  const attempts = await Attempt.find({ quiz: quizId })
    .populate('student', 'fullName email')
    .sort({ createdAt: -1 });

  return { attempts, quiz };
};

/**
 * Get student's own attempts for a quiz.
 */
const getMyAttempts = async (quizId, studentId) => {
  const quiz = await Quiz.findById(quizId).select('-questions.correctAnswer -questions.modelAnswer');
  if (!quiz) throw ApiError.notFound('Quiz not found.');

  const attempts = await Attempt.find({ quiz: quizId, student: studentId })
    .sort({ attemptNumber: 1 });

  return { attempts, quiz };
};

/**
 * Get single attempt detail (teacher for all, student for own).
 */
const getAttemptById = async (attemptId, userId, userRole) => {
  const attempt = await Attempt.findById(attemptId)
    .populate('student', 'fullName email')
    .populate({ path: 'quiz', populate: { path: 'teacher', select: 'fullName email' } });

  if (!attempt) throw ApiError.notFound('Attempt not found.');

  if (userRole === ROLES.STUDENT && String(attempt.student._id) !== String(userId)) {
    throw ApiError.forbidden('This is not your attempt.');
  }
  if (userRole === ROLES.TEACHER && String(attempt.quiz.teacher._id) !== String(userId)) {
    throw ApiError.forbidden('You can only view attempts for your own quizzes.');
  }

  return { attempt };
};

module.exports = {
  // Quiz CRUD
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  setQuestions,
  publishQuiz,
  closeQuiz,
  archiveQuiz,
  deleteQuiz,
  // Attempt flow
  startAttempt,
  saveProgress,
  submitAttempt,
  gradeAnswer,
  getQuizAttempts,
  getMyAttempts,
  getAttemptById,
  // Grades & Transcripts
  getMyGrades
};
