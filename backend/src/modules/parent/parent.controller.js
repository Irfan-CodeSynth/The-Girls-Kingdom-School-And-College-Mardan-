const parentService = require('./parent.service');
const ApiResponse = require('../../utils/ApiResponse');

const getMyChildren = async (req, res, next) => {
  try {
    const children = await parentService.getParentChildren(req.user.id);
    return ApiResponse.success(res, { children }, 'Children retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getChildSummary = async (req, res, next) => {
  try {
    const summary = await parentService.getChildSummary(req.user.id, req.params.studentId);
    return ApiResponse.success(res, summary, 'Child academic summary retrieved.');
  } catch (err) {
    next(err);
  }
};

const getChildAttendance = async (req, res, next) => {
  try {
    const data = await parentService.getChildAttendance(
      req.user.id,
      req.params.studentId,
      req.query
    );
    return ApiResponse.success(res, data, 'Child attendance records retrieved.');
  } catch (err) {
    next(err);
  }
};

const getChildFees = async (req, res, next) => {
  try {
    const data = await parentService.getChildFees(req.user.id, req.params.studentId);
    return ApiResponse.success(res, data, 'Child fee records retrieved.');
  } catch (err) {
    next(err);
  }
};

const getChildQuizzes = async (req, res, next) => {
  try {
    const data = await parentService.getChildQuizzes(req.user.id, req.params.studentId);
    return ApiResponse.success(res, data, 'Child quiz records retrieved.');
  } catch (err) {
    next(err);
  }
};

const getChildExams = async (req, res, next) => {
  try {
    const data = await parentService.getChildExams(req.user.id, req.params.studentId);
    return ApiResponse.success(res, data, 'Child exam schedules retrieved.');
  } catch (err) {
    next(err);
  }
};

const getChildTuitions = async (req, res, next) => {
  try {
    const data = await parentService.getChildTuitions(req.user.id, req.params.studentId);
    return ApiResponse.success(res, data, 'Child online tuitions progress retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyChildren,
  getChildSummary,
  getChildAttendance,
  getChildFees,
  getChildQuizzes,
  getChildExams,
  getChildTuitions,
};
