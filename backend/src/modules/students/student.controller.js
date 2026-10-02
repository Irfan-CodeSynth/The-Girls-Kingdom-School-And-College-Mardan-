const studentService = require('./student.service');
const ApiResponse = require('../../utils/ApiResponse');

const getStudents = async (req, res) => {
  const result = await studentService.getStudents(req.query);
  return ApiResponse.success(res, result, 'Students retrieved successfully');
};

const getStudentById = async (req, res) => {
  const result = await studentService.getStudentById(req.params.id);
  return ApiResponse.success(res, result, 'Student retrieved successfully');
};

const updateStudent = async (req, res) => {
  const updated = await studentService.updateStudent(req.params.id, req.body);
  return ApiResponse.success(res, updated, 'Student updated successfully');
};

const createStudent = async (req, res) => {
  const student = await studentService.createStudent(req.body);
  return ApiResponse.created(res, { student }, 'Student created successfully');
};

const resetStudentPassword = async (req, res) => {
  const result = await studentService.resetStudentPassword(req.params.id, req.body.newPassword);
  return ApiResponse.success(res, result, 'Student password reset successfully');
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  createStudent,
  resetStudentPassword
};
