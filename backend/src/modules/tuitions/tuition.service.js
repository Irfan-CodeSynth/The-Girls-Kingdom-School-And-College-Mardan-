const mongoose = require('mongoose');
const TuitionCourse = require('./tuitionCourse.model');
const TuitionSection = require('./tuitionSection.model');
const TuitionLecture = require('./tuitionLecture.model');
const TuitionEnrollment = require('./tuitionEnrollment.model');
const TuitionProgress = require('./tuitionProgress.model');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../utils/constants');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Compute unlock states sequentially for a list of lectures in a course.
 * First lecture is always unlocked.
 * Each following lecture is unlocked ONLY if all previous lectures have lectureFullyCompleted === true.
 */
const computeUnlockedLectures = (lectures, progressMap) => {
  const result = [];
  for (let i = 0; i < lectures.length; i++) {
    const lecture = lectures[i];
    if (i === 0) {
      result.push({ ...lecture, isLocked: false });
      continue;
    }
    const allPreviousCompleted = lectures.slice(0, i).every((prev) => {
      const prog = progressMap.get(prev._id.toString());
      return prog && Boolean(prog.lectureFullyCompleted);
    });
    result.push({ ...lecture, isLocked: !allPreviousCompleted });
  }
  return result;
};

// ─── ADMIN: COURSE MANAGEMENT ───────────────────────────────────────────────

const createCourse = async (data) => {
  const { title, code, description, thumbnail, instructor, subject, gradeLevel, academicYear } = data;
  const existing = await TuitionCourse.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw ApiError.badRequest(`Course code "${code.toUpperCase()}" already exists.`);
  }
  const course = await TuitionCourse.create({
    title,
    code,
    description: description || '',
    thumbnail: thumbnail || '',
    instructor,
    subject,
    gradeLevel,
    academicYear: academicYear || new Date().getFullYear().toString(),
  });
  return course;
};

const getCourses = async (query, userId, userRole) => {
  const { search, subject, gradeLevel, status, instructorId } = query;
  const safePage = Math.max(1, Number(query.page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(query.limit) || 50), 100);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (userRole === ROLES.TEACHER) {
    filter.instructor = userId;
  } else if (userRole === ROLES.STUDENT) {
    const enrollments = await TuitionEnrollment.find({ student: userId, status: 'active' }).select('course').lean();
    const courseIds = enrollments.map((e) => e.course);
    filter._id = { $in: courseIds };
    filter.status = 'published';
  } else if (userRole === ROLES.ADMIN) {
    if (status) filter.status = status;
    if (instructorId) filter.instructor = instructorId;
  }

  if (subject) filter.subject = { $regex: subject, $options: 'i' };
  if (gradeLevel) filter.gradeLevel = { $regex: gradeLevel, $options: 'i' };
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { code: { $regex: safeSearch, $options: 'i' } },
      { subject: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    TuitionCourse.find(filter)
      .populate('instructor', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    TuitionCourse.countDocuments(filter),
  ]);

  return { courses, pagination: { total, page: safePage, limit: safeLimit, pages: Math.ceil(total / safeLimit) } };
};

const getCourseById = async (courseId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const course = await TuitionCourse.findById(courseId).populate('instructor', 'fullName email');
  if (!course) throw ApiError.notFound('Course not found.');
  return course;
};

const updateCourse = async (courseId, data) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const course = await TuitionCourse.findByIdAndUpdate(courseId, data, { new: true, runValidators: true }).populate('instructor', 'fullName email');
  if (!course) throw ApiError.notFound('Course not found.');
  return course;
};

const deleteCourse = async (courseId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const course = await TuitionCourse.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found.');

  await Promise.all([
    TuitionSection.deleteMany({ course: courseId }),
    TuitionLecture.deleteMany({ course: courseId }),
    TuitionEnrollment.deleteMany({ course: courseId }),
    TuitionProgress.deleteMany({ course: courseId }),
  ]);
  await TuitionCourse.findByIdAndDelete(courseId);
  return { message: 'Course and associated curriculum records deleted.' };
};

// ─── SECTIONS MANAGEMENT ───────────────────────────────────────────────────

const createSection = async (courseId, data) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const course = await TuitionCourse.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found.');

  const count = await TuitionSection.countDocuments({ course: courseId });
  const section = await TuitionSection.create({
    course: courseId,
    title: data.title,
    description: data.description || '',
    order: data.order || count + 1,
  });
  return section;
};

const getSections = async (courseId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  return TuitionSection.find({ course: courseId }).sort({ order: 1 }).lean();
};

const updateSection = async (sectionId, data) => {
  if (!isValidObjectId(sectionId)) throw ApiError.badRequest('Invalid section ID.');
  const section = await TuitionSection.findByIdAndUpdate(sectionId, data, { new: true, runValidators: true });
  if (!section) throw ApiError.notFound('Section not found.');
  return section;
};

const deleteSection = async (sectionId) => {
  if (!isValidObjectId(sectionId)) throw ApiError.badRequest('Invalid section ID.');
  const section = await TuitionSection.findById(sectionId);
  if (!section) throw ApiError.notFound('Section not found.');
  await TuitionLecture.deleteMany({ section: sectionId });
  await TuitionSection.findByIdAndDelete(sectionId);
  return { message: 'Section and its lectures removed.' };
};

// ─── LECTURE MANAGEMENT ────────────────────────────────────────────────────

const createLecture = async (courseId, sectionId, data, userId, userRole) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  if (!isValidObjectId(sectionId)) throw ApiError.badRequest('Invalid section ID.');

  const course = await TuitionCourse.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found.');
  if (userRole === ROLES.TEACHER && course.instructor.toString() !== userId.toString()) {
    throw ApiError.forbidden('You are not assigned as instructor for this course.');
  }

  const section = await TuitionSection.findOne({ _id: sectionId, course: courseId });
  if (!section) throw ApiError.notFound('Section not found in this course.');

  const count = await TuitionLecture.countDocuments({ course: courseId });
  const hasQuiz = Boolean(data.quiz && data.quiz.questions && data.quiz.questions.length > 0);

  const lecture = await TuitionLecture.create({
    course: courseId,
    section: sectionId,
    title: data.title,
    description: data.description || '',
    order: data.order || count + 1,
    video: data.video || { provider: 'youtube', videoId: '', durationSeconds: 0, minWatchPercentage: 90 },
    notes: data.notes || [],
    quiz: data.quiz || { title: '', questions: [] },
    hasQuiz,
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
  });

  await TuitionCourse.findByIdAndUpdate(courseId, { $inc: { totalLecturesCount: 1 } });
  return lecture;
};

const getLectures = async (courseId, sectionId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const filter = { course: courseId };
  if (sectionId && isValidObjectId(sectionId)) filter.section = sectionId;
  return TuitionLecture.find(filter).sort({ order: 1 }).lean();
};

const getLectureById = async (lectureId) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId).populate('section', 'title order');
  if (!lecture) throw ApiError.notFound('Lecture not found.');
  return lecture;
};

const updateLecture = async (lectureId, data, userId, userRole) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId);
  if (!lecture) throw ApiError.notFound('Lecture not found.');

  if (userRole === ROLES.TEACHER) {
    const course = await TuitionCourse.findById(lecture.course);
    if (!course || course.instructor.toString() !== userId.toString()) {
      throw ApiError.forbidden('You are not the instructor of this course.');
    }
  }

  if (data.quiz && data.quiz.questions) {
    data.hasQuiz = data.quiz.questions.length > 0;
  }

  const updated = await TuitionLecture.findByIdAndUpdate(lectureId, data, { new: true, runValidators: true });
  return updated;
};

const deleteLecture = async (lectureId) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId);
  if (!lecture) throw ApiError.notFound('Lecture not found.');

  await TuitionProgress.deleteMany({ lecture: lectureId });
  await TuitionLecture.findByIdAndDelete(lectureId);
  await TuitionCourse.findByIdAndUpdate(lecture.course, { $inc: { totalLecturesCount: -1 } });
  return { message: 'Lecture deleted.' };
};

// ─── ADMIN: ENROLLMENT MANAGEMENT ──────────────────────────────────────────

const enrollStudent = async (courseId, studentId, adminId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  if (!isValidObjectId(studentId)) throw ApiError.badRequest('Invalid student ID.');

  const course = await TuitionCourse.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found.');

  const existing = await TuitionEnrollment.findOne({ course: courseId, student: studentId });
  if (existing) {
    if (existing.status === 'active') {
      throw ApiError.badRequest('Student is already actively enrolled in this tuition course.');
    }
    existing.status = 'active';
    await existing.save();
    return existing;
  }

  const enrollment = await TuitionEnrollment.create({
    course: courseId,
    student: studentId,
    enrolledBy: adminId,
    status: 'active',
  });
  return enrollment;
};

const getCourseEnrollments = async (courseId, query) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const safePage = Math.max(1, Number(query.page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(query.limit) || 50), 100);
  const skip = (safePage - 1) * safeLimit;
  const filter = { course: courseId };
  if (query.status) filter.status = query.status;

  const [enrollments, total] = await Promise.all([
    TuitionEnrollment.find(filter)
      .populate('student', 'fullName email')
      .populate('enrolledBy', 'fullName')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    TuitionEnrollment.countDocuments(filter),
  ]);

  return { enrollments, pagination: { total, page: safePage, limit: safeLimit, pages: Math.ceil(total / safeLimit) } };
};

const updateEnrollmentStatus = async (enrollmentId, status) => {
  if (!isValidObjectId(enrollmentId)) throw ApiError.badRequest('Invalid enrollment ID.');
  const enrollment = await TuitionEnrollment.findByIdAndUpdate(enrollmentId, { status }, { new: true }).populate('student', 'fullName email');
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');
  return enrollment;
};

// ─── STUDENT: CURRICULUM WITH SEQUENTIAL UNLOCK RULES ──────────────────────

const getStudentCourseCurriculum = async (courseId, studentId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');

  const enrollment = await TuitionEnrollment.findOne({ course: courseId, student: studentId, status: 'active' });
  if (!enrollment) throw ApiError.forbidden('You are not currently enrolled in this online tuition course.');

  const course = await TuitionCourse.findById(courseId).populate('instructor', 'fullName email').lean();
  if (!course) throw ApiError.notFound('Course not found.');

  const sections = await TuitionSection.find({ course: courseId }).sort({ order: 1 }).lean();
  const allLectures = await TuitionLecture.find({ course: courseId, isPublished: true }).sort({ order: 1 }).lean();

  const progressRecords = await TuitionProgress.find({ student: studentId, course: courseId }).lean();
  const progressMap = new Map(progressRecords.map((p) => [p.lecture.toString(), p]));

  // Compute unlock state sequentially across course
  const lecturesWithLock = computeUnlockedLectures(allLectures, progressMap);

  const lecturesBySection = {};
  lecturesWithLock.forEach((lec) => {
    const secId = lec.section.toString();
    if (!lecturesBySection[secId]) lecturesBySection[secId] = [];
    const progress = progressMap.get(lec._id.toString());
    lecturesBySection[secId].push({
      ...lec,
      progress: progress || null,
    });
  });

  const curriculum = sections.map((sec) => ({
    ...sec,
    lectures: lecturesBySection[sec._id.toString()] || [],
  }));

  const totalLectures = allLectures.length;
  const completedLectures = progressRecords.filter((p) => p.lectureFullyCompleted).length;
  const progressPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  await TuitionEnrollment.findByIdAndUpdate(enrollment._id, { progressPercentage });

  return {
    course,
    curriculum,
    enrollment: { ...enrollment.toObject ? enrollment.toObject() : enrollment, progressPercentage },
    stats: { totalLectures, completedLectures, progressPercentage },
  };
};

// ─── STUDENT: GET SINGLE LECTURE (WITH LOCK GUARD) ─────────────────────────

const getStudentLecture = async (lectureId, studentId) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId).populate('section', 'title order');
  if (!lecture) throw ApiError.notFound('Lecture not found.');

  const enrollment = await TuitionEnrollment.findOne({ course: lecture.course, student: studentId, status: 'active' });
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course.');

  const allLectures = await TuitionLecture.find({ course: lecture.course, isPublished: true }).sort({ order: 1 }).lean();
  const progressRecords = await TuitionProgress.find({ student: studentId, course: lecture.course }).lean();
  const progressMap = new Map(progressRecords.map((p) => [p.lecture.toString(), p]));

  const lectureIndex = allLectures.findIndex((l) => l._id.toString() === lectureId.toString());
  let isLocked = false;
  if (lectureIndex > 0) {
    const previousLectures = allLectures.slice(0, lectureIndex);
    isLocked = !previousLectures.every((prev) => {
      const prog = progressMap.get(prev._id.toString());
      return prog && Boolean(prog.lectureFullyCompleted);
    });
  }

  if (isLocked) {
    throw ApiError.forbidden('Previous lectures must be completed before you can access this lecture.');
  }

  const progress = progressMap.get(lectureId.toString()) || null;
  const lectureObj = lecture.toObject();

  // Strip correct answer flags from quiz so student cannot inspect payload
  if (lectureObj.quiz && lectureObj.quiz.questions) {
    lectureObj.quiz.questions = lectureObj.quiz.questions.map((q) => ({
      ...q,
      options: (q.options || []).map(({ _id, text }) => ({ _id, text })),
    }));
  }

  return { lecture: lectureObj, progress, isLocked: false };
};

// ─── STUDENT: UPDATE VIDEO WATCH PROGRESS ──────────────────────────────────

const updateVideoProgress = async (lectureId, studentId, watchTimeSeconds, watchPercentage) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId);
  if (!lecture) throw ApiError.notFound('Lecture not found.');

  const enrollment = await TuitionEnrollment.findOne({ course: lecture.course, student: studentId, status: 'active' });
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course.');

  const minRequired = (lecture.video && lecture.video.minWatchPercentage) || 90;
  const isVideoCompleted = watchPercentage >= minRequired;

  let progress = await TuitionProgress.findOne({ student: studentId, lecture: lectureId });

  if (!progress) {
    progress = await TuitionProgress.create({
      student: studentId,
      course: lecture.course,
      lecture: lectureId,
      watchTimeSeconds,
      maxWatchPercentage: watchPercentage,
      videoCompleted: isVideoCompleted,
      videoCompletedAt: isVideoCompleted ? new Date() : null,
      lectureFullyCompleted: isVideoCompleted && !lecture.hasQuiz,
      lectureCompletedAt: isVideoCompleted && !lecture.hasQuiz ? new Date() : null,
    });
  } else {
    const newMaxPercentage = Math.max(progress.maxWatchPercentage || 0, watchPercentage);
    const nowCompleted = newMaxPercentage >= minRequired;

    progress.watchTimeSeconds = Math.max(progress.watchTimeSeconds || 0, watchTimeSeconds);
    progress.maxWatchPercentage = newMaxPercentage;

    if (!progress.videoCompleted && nowCompleted) {
      progress.videoCompleted = true;
      progress.videoCompletedAt = new Date();
    }

    if (progress.videoCompleted && !lecture.hasQuiz && !progress.lectureFullyCompleted) {
      progress.lectureFullyCompleted = true;
      progress.lectureCompletedAt = new Date();
    } else if (progress.videoCompleted && lecture.hasQuiz && progress.quizCompleted && !progress.lectureFullyCompleted) {
      progress.lectureFullyCompleted = true;
      progress.lectureCompletedAt = new Date();
    }

    await progress.save();
  }

  return progress;
};

// ─── STUDENT: SUBMIT LECTURE QUIZ (SUBMISSION UNLOCKS NEXT LECTURE) ────────

const submitLectureQuiz = async (lectureId, studentId, answers = []) => {
  if (!isValidObjectId(lectureId)) throw ApiError.badRequest('Invalid lecture ID.');
  const lecture = await TuitionLecture.findById(lectureId);
  if (!lecture) throw ApiError.notFound('Lecture not found.');
  if (!lecture.hasQuiz) throw ApiError.badRequest('This lecture does not contain a quiz assessment.');

  const enrollment = await TuitionEnrollment.findOne({ course: lecture.course, student: studentId, status: 'active' });
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course.');

  // Guard: Video must be completed before quiz attempt is allowed
  const progress = await TuitionProgress.findOne({ student: studentId, lecture: lectureId });
  if (!progress || !progress.videoCompleted) {
    throw ApiError.badRequest('You must finish watching the video lecture before attempting the quiz.');
  }

  const questions = lecture.quiz.questions || [];
  let score = 0;
  let totalMarks = 0;
  const gradedAnswers = [];

  questions.forEach((q) => {
    totalMarks += q.marks || 1;
    const studentAnswer = answers.find((a) => a.questionId && a.questionId.toString() === q._id.toString());
    const answerEntry = {
      questionId: q._id,
      selectedOption: null,
      textAnswer: '',
      isCorrect: false,
      marksAwarded: 0,
    };

    if (studentAnswer) {
      if (q.type === 'mcq' || q.type === 'true_false') {
        const selectedOption = (q.options || []).find((opt) => opt._id.toString() === (studentAnswer.selectedOption || '').toString());
        if (selectedOption) {
          answerEntry.selectedOption = selectedOption._id;
          answerEntry.isCorrect = Boolean(selectedOption.isCorrect);
          if (selectedOption.isCorrect) {
            answerEntry.marksAwarded = q.marks || 1;
            score += q.marks || 1;
          }
        }
      } else if (q.type === 'short_answer') {
        answerEntry.textAnswer = studentAnswer.textAnswer || '';
      }
    }
    gradedAnswers.push(answerEntry);
  });

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const attemptEntry = {
    answers: gradedAnswers,
    score,
    totalMarks,
    percentage,
    submittedAt: new Date(),
  };

  // Rule: Attempting & Submitting quiz marks quizCompleted and lectureFullyCompleted
  progress.quizCompleted = true;
  progress.quizScore = score;
  progress.quizTotalMarks = totalMarks;
  progress.quizPercentage = percentage;
  progress.quizSubmittedAt = new Date();
  progress.quizAttempts.push(attemptEntry);

  if (progress.videoCompleted) {
    progress.lectureFullyCompleted = true;
    progress.lectureCompletedAt = progress.lectureCompletedAt || new Date();
  }

  await progress.save();
  return { progress, score, totalMarks, percentage, attemptEntry };
};

// ─── TEACHER: ANALYTICS & REVIEW ───────────────────────────────────────────

const getTeacherCourseAnalytics = async (courseId, teacherId) => {
  if (!isValidObjectId(courseId)) throw ApiError.badRequest('Invalid course ID.');
  const course = await TuitionCourse.findOne({ _id: courseId, instructor: teacherId });
  if (!course) throw ApiError.forbidden('Tuition course not found or you are not its instructor.');

  const [enrollments, lectures, progressRecords] = await Promise.all([
    TuitionEnrollment.find({ course: courseId }).populate('student', 'fullName email').lean(),
    TuitionLecture.find({ course: courseId }).sort({ order: 1 }).lean(),
    TuitionProgress.find({ course: courseId }).populate('student', 'fullName email').lean(),
  ]);

  const studentAnalytics = enrollments.map((en) => {
    const studentProgress = progressRecords.filter((p) => p.student && (p.student._id || p.student).toString() === en.student._id.toString());
    const completedLectures = studentProgress.filter((p) => p.lectureFullyCompleted).length;
    const progressPercentage = lectures.length > 0 ? Math.round((completedLectures / lectures.length) * 100) : 0;
    const quizAttemptCount = studentProgress.reduce((sum, p) => sum + (p.quizAttempts ? p.quizAttempts.length : 0), 0);
    return {
      student: en.student,
      enrollmentStatus: en.status,
      progressPercentage,
      completedLectures,
      totalLectures: lectures.length,
      quizAttemptCount,
      enrolledAt: en.enrolledAt,
      detailedProgress: studentProgress,
    };
  });

  const lectureAnalytics = lectures.map((lec) => {
    const lectureProgress = progressRecords.filter((p) => p.lecture && p.lecture.toString() === lec._id.toString());
    const watchedCount = lectureProgress.filter((p) => p.videoCompleted).length;
    const completedCount = lectureProgress.filter((p) => p.lectureFullyCompleted).length;
    const avgWatchPercentage = lectureProgress.length > 0
      ? Math.round(lectureProgress.reduce((sum, p) => sum + (p.maxWatchPercentage || 0), 0) / lectureProgress.length)
      : 0;
    const quizAttempts = lectureProgress.reduce((sum, p) => sum + (p.quizAttempts ? p.quizAttempts.length : 0), 0);
    const completedQuizzes = lectureProgress.filter((p) => p.quizCompleted);
    const avgQuizScore = completedQuizzes.length > 0
      ? Math.round(completedQuizzes.reduce((sum, p) => sum + (p.quizPercentage || 0), 0) / completedQuizzes.length)
      : null;

    return {
      lectureId: lec._id,
      title: lec.title,
      order: lec.order,
      hasQuiz: lec.hasQuiz,
      watchedCount,
      completedCount,
      totalEnrolled: enrollments.length,
      avgWatchPercentage,
      quizAttempts,
      avgQuizScore,
    };
  });

  return { course, studentAnalytics, lectureAnalytics, totalEnrolled: enrollments.length };
};

// ─── ADMIN: OVERVIEW (READ RECORDS & MONITORING) ───────────────────────────

const getAdminTuitionOverview = async () => {
  const [totalCourses, totalEnrollments, activeCourses] = await Promise.all([
    TuitionCourse.countDocuments(),
    TuitionEnrollment.countDocuments({ status: 'active' }),
    TuitionCourse.countDocuments({ status: 'published' }),
  ]);

  const recentEnrollments = await TuitionEnrollment.find({ status: 'active' })
    .populate('student', 'fullName email')
    .populate('course', 'title code')
    .sort({ enrolledAt: -1 })
    .limit(10)
    .lean();

  const courses = await TuitionCourse.find()
    .populate('instructor', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();

  return { totalCourses, totalEnrollments, activeCourses, recentEnrollments, courses };
};

// ─── STUDENT: MY ENROLLMENTS ───────────────────────────────────────────────

const getStudentEnrollments = async (studentId) => {
  const enrollments = await TuitionEnrollment.find({ student: studentId, status: 'active' })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'fullName email' },
    })
    .sort({ enrolledAt: -1 })
    .lean();
  return enrollments;
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createSection,
  getSections,
  updateSection,
  deleteSection,
  createLecture,
  getLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
  enrollStudent,
  getCourseEnrollments,
  updateEnrollmentStatus,
  getStudentCourseCurriculum,
  getStudentLecture,
  updateVideoProgress,
  submitLectureQuiz,
  getTeacherCourseAnalytics,
  getAdminTuitionOverview,
  getStudentEnrollments,
};
