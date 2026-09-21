const classService = require('./class.service');
const ApiResponse = require('../../utils/ApiResponse');

const createClass = async (req, res) => {
  const newClass = await classService.createClass(req.body);
  return ApiResponse.created(res, { class: newClass }, 'Class created successfully');
};

const getClasses = async (req, res) => {
  const result = await classService.getClasses(req.query);
  return ApiResponse.success(res, result, 'Classes retrieved successfully');
};

const getClassById = async (req, res) => {
  const classData = await classService.getClassById(req.params.id);
  return ApiResponse.success(res, classData, 'Class details retrieved successfully');
};

const updateClass = async (req, res) => {
  const updatedClass = await classService.updateClass(req.params.id, req.body);
  return ApiResponse.success(res, { class: updatedClass }, 'Class updated successfully');
};

const enrollStudent = async (req, res) => {
  const enrollment = await classService.enrollStudent(req.body.studentId, req.body.classId);
  return ApiResponse.created(res, { enrollment }, 'Student enrolled into class successfully');
};

const removeStudentEnrollment = async (req, res) => {
  const removed = await classService.removeStudentEnrollment(req.params.id);
  return ApiResponse.success(res, { enrollment: removed }, 'Student enrollment removed successfully');
};

const assignTeacher = async (req, res) => {
  const assignment = await classService.assignTeacherToClass(req.body.teacherId, req.body.classId);
  return ApiResponse.created(res, { assignment }, 'Teacher assigned to class successfully');
};

const removeTeacherAssignment = async (req, res) => {
  const removed = await classService.removeTeacherAssignment(req.params.id);
  return ApiResponse.success(res, { assignment: removed }, 'Teacher removed from class successfully');
};

const getClassStudents = async (req, res) => {
  const students = await classService.getClassStudents(req.params.id);
  return ApiResponse.success(res, { students }, 'Class students retrieved successfully');
};

const getClassTeachers = async (req, res) => {
  const teachers = await classService.getClassTeachers(req.params.id);
  return ApiResponse.success(res, { teachers }, 'Class teachers retrieved successfully');
};

const getMyClassesAsTeacher = async (req, res) => {
  const classes = await classService.getTeacherAssignedClasses(req.user.id);
  return ApiResponse.success(res, { classes }, 'Assigned classes retrieved successfully');
};

const getMyClassAsStudent = async (req, res) => {
  const enrollment = await classService.getStudentEnrollment(req.user.id);
  return ApiResponse.success(
    res,
    { class: enrollment?.class || null, enrollment },
    'Student enrolled class retrieved successfully'
  );
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  enrollStudent,
  removeStudentEnrollment,
  assignTeacher,
  removeTeacherAssignment,
  getClassStudents,
  getClassTeachers,
  getMyClassesAsTeacher,
  getMyClassAsStudent
};
