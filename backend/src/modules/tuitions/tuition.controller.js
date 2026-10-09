const tuitionService = require('./tuition.service');
const ApiResponse = require('../../utils/ApiResponse');

// ─── Course Controllers ───────────────────────────────────────────────────────

const createCourse = async (req, res, next) => {
  try {
    const course = await tuitionService.createCourse(req.body);
    return ApiResponse.created(res, { course }, 'Tuition course created successfully');
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const result = await tuitionService.getCourses(req.query, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Courses retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await tuitionService.getCourseById(req.params.id);
    return ApiResponse.success(res, { course }, 'Course retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await tuitionService.updateCourse(req.params.id, req.body);
    return ApiResponse.success(res, { course }, 'Course updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const result = await tuitionService.deleteCourse(req.params.id);
    return ApiResponse.success(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

// ─── Section Controllers ──────────────────────────────────────────────────────

const createSection = async (req, res, next) => {
  try {
    const section = await tuitionService.createSection(req.params.courseId, req.body);
    return ApiResponse.created(res, { section }, 'Section created successfully');
  } catch (err) {
    next(err);
  }
};

const getSections = async (req, res, next) => {
  try {
    const sections = await tuitionService.getSections(req.params.courseId);
    return ApiResponse.success(res, { sections }, 'Sections retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const section = await tuitionService.updateSection(req.params.sectionId, req.body);
    return ApiResponse.success(res, { section }, 'Section updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const result = await tuitionService.deleteSection(req.params.sectionId);
    return ApiResponse.success(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

// ─── Lecture Controllers ──────────────────────────────────────────────────────

const createLecture = async (req, res, next) => {
  try {
    const lecture = await tuitionService.createLecture(
      req.params.courseId,
      req.params.sectionId,
      req.body,
      req.user.id,
      req.user.role
    );
    return ApiResponse.created(res, { lecture }, 'Lecture created successfully');
  } catch (err) {
    next(err);
  }
};

const getLectures = async (req, res, next) => {
  try {
    const lectures = await tuitionService.getLectures(req.params.courseId, req.query.sectionId);
    return ApiResponse.success(res, { lectures }, 'Lectures retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getLectureById = async (req, res, next) => {
  try {
    const lecture = await tuitionService.getLectureById(req.params.lectureId);
    return ApiResponse.success(res, { lecture }, 'Lecture retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateLecture = async (req, res, next) => {
  try {
    const lecture = await tuitionService.updateLecture(
      req.params.lectureId,
      req.body,
      req.user.id,
      req.user.role
    );
    return ApiResponse.success(res, { lecture }, 'Lecture updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteLecture = async (req, res, next) => {
  try {
    const result = await tuitionService.deleteLecture(req.params.lectureId);
    return ApiResponse.success(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

// ─── Enrollment Controllers ───────────────────────────────────────────────────

const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await tuitionService.enrollStudent(req.params.id, req.body.studentId, req.user.id);
    return ApiResponse.created(res, { enrollment }, 'Student enrolled successfully');
  } catch (err) {
    next(err);
  }
};

const getCourseEnrollments = async (req, res, next) => {
  try {
    const result = await tuitionService.getCourseEnrollments(req.params.id, req.query);
    return ApiResponse.success(res, result, 'Enrollments retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollment = await tuitionService.updateEnrollmentStatus(req.params.enrollmentId, req.body.status);
    return ApiResponse.success(res, { enrollment }, 'Enrollment status updated');
  } catch (err) {
    next(err);
  }
};

// ─── Student Controllers ──────────────────────────────────────────────────────

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await tuitionService.getStudentEnrollments(req.user.id);
    return ApiResponse.success(res, { enrollments }, 'Your enrolled courses retrieved');
  } catch (err) {
    next(err);
  }
};

const getCourseCurriculum = async (req, res, next) => {
  try {
    const result = await tuitionService.getStudentCourseCurriculum(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Course curriculum retrieved');
  } catch (err) {
    next(err);
  }
};

const getStudentLecture = async (req, res, next) => {
  try {
    const result = await tuitionService.getStudentLecture(req.params.lectureId, req.user.id);
    return ApiResponse.success(res, result, 'Lecture retrieved');
  } catch (err) {
    next(err);
  }
};

const updateVideoProgress = async (req, res, next) => {
  try {
    const { watchTimeSeconds, watchPercentage } = req.body;
    const progress = await tuitionService.updateVideoProgress(
      req.params.lectureId,
      req.user.id,
      Number(watchTimeSeconds) || 0,
      Number(watchPercentage) || 0
    );
    return ApiResponse.success(res, { progress }, 'Video progress saved');
  } catch (err) {
    next(err);
  }
};

const submitLectureQuiz = async (req, res, next) => {
  try {
    const result = await tuitionService.submitLectureQuiz(req.params.lectureId, req.user.id, req.body.answers || []);
    return ApiResponse.success(res, result, 'Lecture quiz submitted successfully');
  } catch (err) {
    next(err);
  }
};

// ─── Teacher Controllers ──────────────────────────────────────────────────────

const getTeacherAnalytics = async (req, res, next) => {
  try {
    const result = await tuitionService.getTeacherCourseAnalytics(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Course analytics retrieved');
  } catch (err) {
    next(err);
  }
};

// ─── Admin Controllers ────────────────────────────────────────────────────────

const getAdminOverview = async (req, res, next) => {
  try {
    const result = await tuitionService.getAdminTuitionOverview();
    return ApiResponse.success(res, result, 'Tuitions overview retrieved');
  } catch (err) {
    next(err);
  }
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
  getMyEnrollments,
  getCourseCurriculum,
  getStudentLecture,
  updateVideoProgress,
  submitLectureQuiz,
  getTeacherAnalytics,
  getAdminOverview,
};
