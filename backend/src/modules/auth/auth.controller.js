const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

const registerStudent = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerStudent(req.body);
    return ApiResponse.created(res, { user, token }, 'Student registered successfully');
  } catch (err) {
    next(err);
  }
};

const registerTeacher = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerTeacher(req.body);
    return ApiResponse.created(res, { user, token }, 'Teacher registered successfully');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    return ApiResponse.success(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return ApiResponse.success(res, { user }, 'User profile fetched successfully');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return ApiResponse.success(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerStudent,
  registerTeacher,
  login,
  logout,
  getMe,
  changePassword
};
