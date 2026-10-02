const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const StudentProfile = require('../users/studentProfile.model');
const TeacherProfile = require('../users/teacherProfile.model');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');
const { ROLES } = require('../../utils/constants');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
    algorithm: 'HS256'
  });
};

const registerStudent = async (data) => {
  const email = (data.email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict('Email already in use');

  const studentId = (data.studentId || '').trim();
  const existingStudent = await StudentProfile.findOne({ studentId });
  if (existingStudent) throw ApiError.conflict('Student ID already in use');

  const user = await User.create({
    fullName: data.fullName.trim(),
    email,
    password: data.password,
    role: ROLES.STUDENT,
    phone: data.phone,
    profilePhoto: data.profilePhoto
  });

  await StudentProfile.create({
    user: user._id,
    studentId
  });

  const token = generateToken(user._id, user.role);
  return { user, token };
};

const registerTeacher = async (data) => {
  const email = (data.email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict('Email already in use');

  const teacherId = (data.teacherId || '').trim();
  const existingTeacher = await TeacherProfile.findOne({ teacherId });
  if (existingTeacher) throw ApiError.conflict('Teacher ID already in use');

  const user = await User.create({
    fullName: data.fullName.trim(),
    email,
    password: data.password,
    role: ROLES.TEACHER,
    phone: data.phone
  });

  await TeacherProfile.create({
    user: user._id,
    teacherId,
    department: data.department
  });

  const token = generateToken(user._id, user.role);
  return { user, token };
};

const login = async (email, password) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account is deactivated');
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  return { user, token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === ROLES.STUDENT) {
    const profile = await StudentProfile.findOne({ user: userId });
    return { ...user.toJSON(), profile };
  }
  
  if (user.role === ROLES.TEACHER) {
    const profile = await TeacherProfile.findOne({ user: userId });
    return { ...user.toJSON(), profile };
  }

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Incorrect current password');
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  return true;
};

module.exports = {
  registerStudent,
  registerTeacher,
  login,
  getMe,
  changePassword
};
