const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

const registerStudent = async (req, res) => {
  const { user, token } = await authService.registerStudent(req.body);
  return ApiResponse.created(res, { user, token }, 'Student registered successfully');
};

const registerTeacher = async (req, res) => {
  const { user, token } = await authService.registerTeacher(req.body);
  return ApiResponse.created(res, { user, token }, 'Teacher registered successfully');
};

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body.email, req.body.password);
  return ApiResponse.success(res, { user, token }, 'Login successful');
};

const logout = async (req, res) => {
  return ApiResponse.success(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return ApiResponse.success(res, { user }, 'User profile fetched successfully');
};

const changePassword = async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  return ApiResponse.success(res, null, 'Password changed successfully');
};

module.exports = {
  registerStudent,
  registerTeacher,
  login,
  logout,
  getMe,
  changePassword
};
