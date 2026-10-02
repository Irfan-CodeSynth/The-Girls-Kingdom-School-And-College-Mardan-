const {
  bulkUpsertAttendance,
  getAttendanceByDate,
  getClassAttendanceSummary,
  getStudentAttendance,
} = require('./attendance.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/**
 * POST /api/classes/:id/attendance
 * Records or updates attendance in bulk for a class on a specific date.
 */
const createOrUpdateAttendance = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const teacherId = req.user?.id || req.user?._id;
    const { date, records } = req.body;

    const result = await bulkUpsertAttendance(classId, date, records, teacherId);
    return ApiResponse.success(res, result, 'Attendance recorded successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/classes/:id/attendance?date=YYYY-MM-DD
 * Retrieves attendance records for a class on a given date.
 */
const fetchAttendanceByDate = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const { date } = req.query;

    if (!date) {
      throw ApiError.badRequest('Missing required query parameter: date (YYYY-MM-DD)');
    }

    const records = await getAttendanceByDate(classId, date);
    return ApiResponse.success(res, { records, date }, 'Attendance retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/classes/:id/attendance/summary
 * Retrieves overall attendance analytics summary for a class.
 */
const fetchClassSummary = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const summary = await getClassAttendanceSummary(classId);
    return ApiResponse.success(res, { summary }, 'Class attendance summary retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/classes/:id/attendance/my-attendance
 * Student view of their own attendance for a specific class or across classes.
 */
const fetchMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const classId = req.params.id || req.query.classId;
    const records = await getStudentAttendance(studentId, classId);
    return ApiResponse.success(res, { records }, 'Student attendance records retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrUpdateAttendance,
  fetchAttendanceByDate,
  fetchClassSummary,
  fetchMyAttendance,
};
