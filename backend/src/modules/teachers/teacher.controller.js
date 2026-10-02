const teacherService = require('./teacher.service');
const ApiResponse = require('../../utils/ApiResponse');

const getTeachers = async (req, res) => {
  const result = await teacherService.getTeachers(req.query);
  return ApiResponse.success(res, result, 'Teachers retrieved successfully');
};

const getTeacherById = async (req, res) => {
  const result = await teacherService.getTeacherById(req.params.id);
  return ApiResponse.success(res, result, 'Teacher retrieved successfully');
};

const updateTeacher = async (req, res) => {
  const updated = await teacherService.updateTeacher(req.params.id, req.body);
  return ApiResponse.success(res, updated, 'Teacher updated successfully');
};

const createTeacher = async (req, res) => {
  const teacher = await teacherService.createTeacher(req.body);
  return ApiResponse.created(res, { teacher }, 'Teacher created successfully');
};

const resetTeacherPassword = async (req, res) => {
  const result = await teacherService.resetTeacherPassword(req.params.id, req.body.newPassword);
  return ApiResponse.success(res, result, 'Teacher password reset successfully');
};

module.exports = {
  getTeachers,
  getTeacherById,
  updateTeacher,
  createTeacher,
  resetTeacherPassword
};
