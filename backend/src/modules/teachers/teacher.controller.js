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

module.exports = {
  getTeachers,
  getTeacherById,
  updateTeacher
};
